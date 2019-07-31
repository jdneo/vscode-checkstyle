/*
 * Copyright (C) jdneo

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.shengchen.checkstyle.runner;

import com.puppycrawl.tools.checkstyle.Checker;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader.IgnoredModulesOptions;
import com.puppycrawl.tools.checkstyle.PropertiesExpander;
import com.puppycrawl.tools.checkstyle.api.CheckstyleException;
import com.puppycrawl.tools.checkstyle.api.Configuration;
import com.shengchen.checkstyle.runner.quickfix.BaseQuickFix;
import com.shengchen.checkstyle.runner.utils.EditUtils;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.jdt.core.ICompilationUnit;
import org.eclipse.jdt.core.JavaModelException;
import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.CompilationUnit;
import org.eclipse.jdt.internal.corext.dom.IASTSharedValues;
import org.eclipse.jdt.ls.core.internal.JDTUtils;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.Document;
import org.eclipse.jface.text.IRegion;
import org.eclipse.lsp4j.WorkspaceEdit;
import org.eclipse.text.edits.TextEdit;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

@SuppressWarnings("restriction")
public class CheckstyleRunner {
    public static Map<String, List<CheckResult>> checkCode(
        List<String> filesToCheckUris,
        String configurationFsPath,
        Map<String, String> properties            
    ) throws UnsupportedEncodingException, CoreException, CheckstyleException {
        if (filesToCheckUris.isEmpty()) {
            return Collections.emptyMap();
        }
        
        final List<File> filesToCheck = filesToCheckUris.stream()
                .map(file -> new File(file))
                .collect(Collectors.toList());

        final Checker checker = new Checker();
        
        final ICompilationUnit unit = JDTUtils.resolveCompilationUnit(filesToCheck.get(0).toURI());
        checker.setCharset(unit.getJavaProject().getProject().getDefaultCharset());

        // reset the basedir if it is set so it won't get into the plugins way
        // of determining workspace resources from checkstyle reported file
        // names, see
        // https://sourceforge.net/tracker/?func=detail&aid=2880044&group_id=80344&atid=559497
        checker.setBasedir(null);
        checker.setModuleClassLoader(Checker.class.getClassLoader());
        
        final Properties checkstyleProperties = new Properties();
        checkstyleProperties.putAll(properties);
        final Configuration configuration = ConfigurationLoader.loadConfiguration(configurationFsPath,
                new PropertiesExpander(checkstyleProperties), IgnoredModulesOptions.OMIT);
        checker.configure(configuration);
        
        final CheckstyleExecutionListener listener = new CheckstyleExecutionListener();
        checker.addListener(listener);
        checker.process(filesToCheck);

        return listener.getResult();
    }

    public static WorkspaceEdit quickFix(
        String fileToCheckUri,
        int offset,
        String sourceName
    ) throws JavaModelException, IllegalArgumentException, BadLocationException {
        final BaseQuickFix quickFix = QuickFixProvider.getQuickFix(sourceName);
        if (quickFix == null) {
            throw new RuntimeException("Unsupported quick fix.");
        }

        final ICompilationUnit unit = JDTUtils.resolveCompilationUnit(fileToCheckUri);
        final Document document = new Document(unit.getSource());
        final IRegion lineInfo = document.getLineInformationOfOffset(offset);
        final ASTParser astParser = ASTParser.newParser(IASTSharedValues.SHARED_AST_LEVEL);
        astParser.setKind(ASTParser.K_COMPILATION_UNIT);
        astParser.setSource(unit);
        final CompilationUnit astRoot = (CompilationUnit) astParser.createAST(null);
        astRoot.recordModifications();
        astRoot.accept(quickFix.getCorrectingASTVisitor(lineInfo, offset));
        final TextEdit edit = astRoot.rewrite(document, null);
        return EditUtils.convertToWorkspaceEdit(unit, edit);
    }
}

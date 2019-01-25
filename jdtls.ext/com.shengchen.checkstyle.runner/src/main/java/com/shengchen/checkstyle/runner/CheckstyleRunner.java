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
import org.eclipse.jdt.core.dom.rewrite.ASTRewrite;
import org.eclipse.jdt.internal.corext.dom.IASTSharedValues;
import org.eclipse.jdt.ls.core.internal.JDTUtils;
import org.eclipse.jface.text.Document;
import org.eclipse.lsp4j.WorkspaceEdit;
import org.eclipse.text.edits.TextEdit;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@SuppressWarnings("restriction")
public class CheckstyleRunner {
    public static List<CheckResult> check(List<Object> arguments)
            throws UnsupportedEncodingException, CoreException, CheckstyleException {
        if (arguments == null || arguments.size() < 2) {
            throw new RuntimeException("Illegal arguments for checking.");
        }
        final String fileToCheckUri = (String) arguments.get(0);
        final String configurationFsPath = (String) arguments.get(1);
        final ICompilationUnit unit = JDTUtils.resolveCompilationUnit(fileToCheckUri);

        final Checker checker = new Checker();
        checker.setCharset(unit.getJavaProject().getProject().getDefaultCharset());

        // reset the basedir if it is set so it won't get into the plugins way
        // of determining workspace resources from checkstyle reported file
        // names, see
        // https://sourceforge.net/tracker/?func=detail&aid=2880044&group_id=80344&atid=559497
        checker.setBasedir(null);
        checker.setModuleClassLoader(Thread.currentThread().getContextClassLoader());
        final Configuration configuration = ConfigurationLoader.loadConfiguration(configurationFsPath,
                new PropertiesExpander(new Properties()), IgnoredModulesOptions.OMIT);
        checker.configure(configuration);
        final CheckstyleExecutionListener listener = new CheckstyleExecutionListener();
        checker.addListener(listener);
        final List<File> filesToCheck = new ArrayList<>();
        filesToCheck.add(new File(URI.create(fileToCheckUri)));
        checker.process(filesToCheck);

        return listener.getResult();
    }

    public static WorkspaceEdit quickFix(List<Object> arguments) throws JavaModelException, IllegalArgumentException {
        if (arguments == null || arguments.size() < 3) {
            throw new RuntimeException("Illegal arguments for checking.");
        }
        final String fileToCheckUri = (String) arguments.get(0);
        final int offset = ((Double) arguments.get(1)).intValue();
        final String sourceName = (String) arguments.get(2);

        final BaseQuickFix quickFix = QuickFixProvider.getQuickFix(sourceName);
        if (quickFix == null) {
            throw new RuntimeException("Unsupported quick fix.");
        }

        final ICompilationUnit unit = JDTUtils.resolveCompilationUnit(fileToCheckUri);
        final ASTParser astParser = ASTParser.newParser(IASTSharedValues.SHARED_AST_LEVEL);
        astParser.setKind(ASTParser.K_COMPILATION_UNIT);
        astParser.setSource(unit);
        final CompilationUnit astRoot = (CompilationUnit) astParser.createAST(null);
        final Document document = new Document(unit.getSource());
        final ASTRewrite rewrite = ASTRewrite.create(astRoot.getAST());
        astRoot.recordModifications();
        astRoot.accept(quickFix.getCorrectingASTVisitor(offset));
        final TextEdit edit = rewrite.rewriteAST(document, null);
        return EditUtils.convertToWorkspaceEdit(unit, edit);
    }
}

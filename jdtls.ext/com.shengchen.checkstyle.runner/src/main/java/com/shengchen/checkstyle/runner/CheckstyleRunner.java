package com.shengchen.checkstyle.runner;

import com.puppycrawl.tools.checkstyle.Checker;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader;
import com.puppycrawl.tools.checkstyle.ConfigurationLoader.IgnoredModulesOptions;
import com.puppycrawl.tools.checkstyle.PropertiesExpander;
import com.puppycrawl.tools.checkstyle.api.CheckstyleException;
import com.puppycrawl.tools.checkstyle.api.Configuration;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.jdt.core.ICompilationUnit;
import org.eclipse.jdt.ls.core.internal.JDTUtils;

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
//
//      final CompilationUnit astRoot = CoreASTProvider.getInstance().getAST(unit,
//        CoreASTProvider.WAIT_YES, null);
//        ASTParser astParser = ASTParser.newParser(AST.JLS8);
//        astParser.setKind(ASTParser.K_COMPILATION_UNIT);
//        astParser.setSource(unit);
//        CompilationUnit astRoot = (CompilationUnit) astParser.createAST(null);
//        astRoot.recordModifications();
//        astRoot.accept(new ASTVisitor() {
//
//            @SuppressWarnings("unchecked")
//            @Override
//            public boolean visit(SingleVariableDeclaration node) {
//                if (!Modifier.isFinal(node.getModifiers())) {
//                    Modifier finalModifier = node.getAST().newModifier(
//        ModifierKeyword.FINAL_KEYWORD);
//                    node.modifiers().add(finalModifier);
//                }
//                return true;
//            }
//
//            @SuppressWarnings("unchecked")
//            @Override
//            public boolean visit(VariableDeclarationStatement node) {
//                if (!Modifier.isFinal(node.getModifiers())) {
//                    Modifier finalModifier = node.getAST()
//        .newModifier(ModifierKeyword.FINAL_KEYWORD);
//                    node.modifiers().add(finalModifier);
//                }
//                return true;
//            }
//        });
//        IPath path = unit.getPath();
//        ASTRewrite rewrite = ASTRewrite.create(astRoot.getAST());
//        TextEdit edit = rewrite.rewriteAST();
//        ITextFileBufferManager bufferManager = FileBuffers.getTextFileBufferManager();
//        bufferManager.connect(path, LocationKind.IFILE, null);
//        ITextFileBuffer textFileBuffer = bufferManager.getTextFileBuffer(path, LocationKind.IFILE);
//        IDocument document = textFileBuffer.getDocument();
//        TextEdit edit = astRoot.rewrite(document, unit.getJavaProject().getOptions(true));
//        IJavaElement element = JDTUtils.findElementAtSelection
//        (unit, Integer.valueOf(listener.getResult()[1]).intValue() - 1,
//                Integer.valueOf(listener.getResult()[2]).intValue() - 1, null, null);
//        final ASTNode name = NodeFinder.perform(astRoot, ((ISourceReference) element).getNameRange());
//        ASTRewrite rewrite = ASTRewrite.create(name.getAST());
//        Modifier finalModifier = name.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
////        rewrite.set(name, VariableDeclarationStatement.MODIFIERS2_PROPERTY, finalModifier, null);
//        if (name instanceof VariableDeclarationStatement ) {
//            ((VariableDeclarationStatement)name).modifiers().add(finalModifier);
//        }
//        rewrite.rewriteAST();
//        List<String> result = Arrays.asList(listener.getResult());
//        return result.toArray(new String[result.size()]);
    }
}

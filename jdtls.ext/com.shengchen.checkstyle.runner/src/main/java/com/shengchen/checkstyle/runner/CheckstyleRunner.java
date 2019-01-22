package com.shengchen.checkstyle.runner;

import java.io.UnsupportedEncodingException;
import java.util.List;

import org.eclipse.core.runtime.CoreException;

import com.puppycrawl.tools.checkstyle.api.CheckstyleException;

@SuppressWarnings("restriction")
public class CheckstyleRunner {
	public static String[] check(List<Object> arguments) throws UnsupportedEncodingException, CoreException, CheckstyleException {
		return null;
		
//		ICompilationUnit unit = JDTUtils.resolveCompilationUnit(fileToCheckUri);
//
//		Checker checker = new Checker();
//		checker.setCharset(unit.getJavaProject().getProject().getDefaultCharset());
//
//		checker.setBasedir(null);
//		final PackageObjectFactory factory = new PackageObjectFactory(new HashSet<>(),
//				Thread.currentThread().getContextClassLoader());
//		checker.setModuleFactory(factory);
//		Configuration configuration = ConfigurationLoader.loadConfiguration(configurationFsPath,
//				new PropertiesExpander(new Properties()));
//		checker.configure(configuration);
//		Listener listener = new Listener();
//		checker.addListener(listener);
//		List<File> filesToCheck = new ArrayList<>();
//		filesToCheck.add(new File(URI.create(fileToCheckUri)));
//		checker.process(filesToCheck);
////		final CompilationUnit astRoot = CoreASTProvider.getInstance().getAST(unit, CoreASTProvider.WAIT_YES, null);
//		ASTParser astParser = ASTParser.newParser(AST.JLS8);
//		astParser.setKind(ASTParser.K_COMPILATION_UNIT);
//	    astParser.setSource(unit);
//	    CompilationUnit astRoot = (CompilationUnit) astParser.createAST(null);
//		astRoot.recordModifications();
//		astRoot.accept(new ASTVisitor() {
//
//			@SuppressWarnings("unchecked")
//			@Override
//			public boolean visit(SingleVariableDeclaration node) {
//				if (!Modifier.isFinal(node.getModifiers())) {
//					Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
//					node.modifiers().add(finalModifier);
//				}
//				return true;
//			}
//
//			@SuppressWarnings("unchecked")
//			@Override
//			public boolean visit(VariableDeclarationStatement node) {
//				if (!Modifier.isFinal(node.getModifiers())) {
//					Modifier finalModifier = node.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
//					node.modifiers().add(finalModifier);
//				}
//				return true;
//			}
//		});
//		IPath path = unit.getPath();
//		ASTRewrite rewrite = ASTRewrite.create(astRoot.getAST());
//		TextEdit edit = rewrite.rewriteAST();
//		ITextFileBufferManager bufferManager = FileBuffers.getTextFileBufferManager();
//		bufferManager.connect(path, LocationKind.IFILE, null);
//		ITextFileBuffer textFileBuffer = bufferManager.getTextFileBuffer(path, LocationKind.IFILE);
//		IDocument document = textFileBuffer.getDocument();
//		TextEdit edit = astRoot.rewrite(document, unit.getJavaProject().getOptions(true));
//		IJavaElement element = JDTUtils.findElementAtSelection(unit, Integer.valueOf(listener.getResult()[1]).intValue() - 1,
//				Integer.valueOf(listener.getResult()[2]).intValue() - 1, null, null);
//		final ASTNode name = NodeFinder.perform(astRoot, ((ISourceReference) element).getNameRange());
//		ASTRewrite rewrite = ASTRewrite.create(name.getAST());
//		Modifier finalModifier = name.getAST().newModifier(ModifierKeyword.FINAL_KEYWORD);
////		rewrite.set(name, VariableDeclarationStatement.MODIFIERS2_PROPERTY, finalModifier, null);
//		if (name instanceof VariableDeclarationStatement ) {
//			((VariableDeclarationStatement)name).modifiers().add(finalModifier);
//		}
//		rewrite.rewriteAST();
//		List<String> result = Arrays.asList(listener.getResult());
//		return result.toArray(new String[result.size()]);
	}
}

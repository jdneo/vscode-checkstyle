package com.shengchen.checkstyle.runner.handler;

import java.util.List;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;

import com.shengchen.checkstyle.runner.CheckstyleRunner;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {
	
	private static final String CHECK_CODE_WITH_CHECKSTYLE = "java.checkstyle.check";

	@Override
	public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
		switch(commandId) {
			case CHECK_CODE_WITH_CHECKSTYLE:
				return CheckstyleRunner.check(arguments);
		}
		return null;
	}

}

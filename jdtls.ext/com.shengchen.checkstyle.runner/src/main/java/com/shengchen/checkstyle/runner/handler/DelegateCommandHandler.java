package com.shengchen.checkstyle.runner.handler;

import com.shengchen.checkstyle.runner.CheckstyleRunner;

import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;

import java.util.List;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {

    private static final String CHECK_CODE_WITH_CHECKSTYLE = "java.checkstyle.check";

    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor) throws Exception {
        switch (commandId) {
            case CHECK_CODE_WITH_CHECKSTYLE:
                return CheckstyleRunner.check(arguments);
        }
        return null;
    }

}

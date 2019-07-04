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

package com.shengchen.checkstyle.runner.handler;

import com.puppycrawl.tools.checkstyle.api.CheckstyleException;
import com.shengchen.checkstyle.runner.CheckstyleRunner;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.jdt.ls.core.internal.IDelegateCommandHandler;
import org.eclipse.lsp4j.jsonrpc.ResponseErrorException;
import org.eclipse.lsp4j.jsonrpc.messages.ResponseError;
import org.eclipse.lsp4j.jsonrpc.messages.ResponseErrorCode;

import java.io.UnsupportedEncodingException;
import java.util.List;

@SuppressWarnings("restriction")
public class DelegateCommandHandler implements IDelegateCommandHandler {

    private static final String CHECK_CODE_WITH_CHECKSTYLE = "java.checkstyle.checkcode";
    private static final String FIX_CHECKSTYLE_VIOLATION = "java.checkstyle.quickfix";

    @Override
    public Object executeCommand(String commandId, List<Object> arguments, IProgressMonitor monitor)
            throws ResponseErrorException {
        try {
            switch (commandId) {
                case CHECK_CODE_WITH_CHECKSTYLE:
                    return CheckstyleRunner.check(arguments);
                case FIX_CHECKSTYLE_VIOLATION:
                    return CheckstyleRunner.quickFix(arguments);
                default:
                    throw new ResponseErrorException(
                            new ResponseError(ResponseErrorCode.MethodNotFound, "Unknown command", commandId));
            }
        } catch (Throwable ex) {
            throw asResponseException(ex, commandId, arguments);
            // throw new ResponseErrorException(new ResponseError(-32123, "Emmm", null));
        }
    }

    private ResponseErrorException asResponseException(Throwable ex, String commandId, List<Object> arguments) {
        if (ex instanceof ResponseErrorException) {
            return (ResponseErrorException) ex;
        }
        if (ex instanceof IllegalArgumentException) {
            return new ResponseErrorException(
                    new ResponseError(ResponseErrorCode.InvalidParams, ex.getMessage(), arguments));
        }
        if (ex instanceof CheckstyleException) {
            return new ResponseErrorException(new ResponseError(ResponseErrorCode.InvalidRequest, ex.getMessage(), ex));
        }
        if (ex instanceof UnsupportedEncodingException) {
            return new ResponseErrorException(new ResponseError(ResponseErrorCode.ParseError, ex.getMessage(), ex));
        }
        if (ex instanceof RuntimeException || ex instanceof CoreException) {
            return new ResponseErrorException(new ResponseError(ResponseErrorCode.InternalError, ex.getMessage(), ex));
        }
        return new ResponseErrorException(new ResponseError(ResponseErrorCode.UnknownErrorCode, ex.getMessage(), ex));
    }
}

package com.shengchen.checkstyle.runner;

import com.puppycrawl.tools.checkstyle.api.AuditEvent;
import com.puppycrawl.tools.checkstyle.api.AuditListener;
import com.puppycrawl.tools.checkstyle.api.SeverityLevel;

public class Listener implements AuditListener {

	private String line;
	private String column;
	private String msg;
	
	@Override
	public void addError(AuditEvent error) {
		SeverityLevel severity = error.getSeverityLevel();
		if (severity.equals(SeverityLevel.IGNORE)) {
			return;
		}
		this.msg = error.getMessage();
		this.line = String.valueOf(error.getLine());
		this.column = String.valueOf(error.getColumn());
		
	}

	@Override
	public void addException(AuditEvent arg0, Throwable arg1) {
		return;
		
	}

	@Override
	public void auditFinished(AuditEvent arg0) {
		return;
	}

	@Override
	public void auditStarted(AuditEvent arg0) {
		return;
	}

	@Override
	public void fileFinished(AuditEvent arg0) {
		return;
	}

	@Override
	public void fileStarted(AuditEvent arg0) {
		return;
	}
	
	public String[] getResult() {
		return new String[] {this.msg, this.line, this.column};
	}
}

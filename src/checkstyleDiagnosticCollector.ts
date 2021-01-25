// Copyright (c) jdneo. All rights reserved.
// Licensed under the GNU LGPLv3 license.

import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, Disposable, languages, Range, Uri } from 'vscode';
import { ICheckstyleDiagnostic, ICheckstyleResult } from './models';

class CheckstyleDiagnosticCollector implements Disposable {
    private diagnosticCollection: DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = languages.createDiagnosticCollection('Checkstyle');
    }

    public addDiagnostics(uri: Uri, violations: ICheckstyleResult[]): void {
        const diagnostics: ICheckstyleDiagnostic[] = [];
        for (const violation of violations) {
            if (violation.severity === 'ignore') {
                continue; // Do not report ignored diagnostics
            }
            const startLine: number = Math.max(violation.line - 1, 0);
            const startCharacter: number = Math.max(violation.column - 1, 0);
            diagnostics.push({
                range: new Range(startLine, startCharacter, startLine + 1, 0),
                message: violation.message,
                severity: this.parseDiagnosticSeverity(violation.severity),
                source: 'Checkstyle',
                code: violation.sourceName,
                violationKey: violation.key,
            });
        }
        this.diagnosticCollection.set(uri, diagnostics);
    }

    public diagnostics(uri: Uri): Diagnostic[] | undefined {
        return this.diagnosticCollection.get(uri);
    }

    public getAllDiagnostics(): Diagnostic[][] {
        const allDiagnostics: Diagnostic[][] = [];
        this.diagnosticCollection.forEach((_uri: Uri, diagnostics: Diagnostic[]) => {
            allDiagnostics.push(diagnostics);
        });
        return allDiagnostics;
    }

    public getResourceUris(): Uri[] {
        const uris: Uri[] = [];
        this.diagnosticCollection.forEach((uri: Uri) => uris.push(uri));
        return uris;
    }

    public delete(uri: Uri): void {
        this.diagnosticCollection.delete(uri);
    }

    public clear(): void {
        this.diagnosticCollection.clear();
    }

    public dispose(): void {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.clear();
            this.diagnosticCollection.dispose();
        }
    }

    private parseDiagnosticSeverity(severity: ICheckstyleResult['severity']): DiagnosticSeverity {
        switch (severity) {
            case 'info':
                return DiagnosticSeverity.Information;
            case 'warning':
                return DiagnosticSeverity.Warning;
            case 'error':
            default:
                return DiagnosticSeverity.Error;
        }
    }

}

export const checkstyleDiagnosticCollector: CheckstyleDiagnosticCollector = new CheckstyleDiagnosticCollector();

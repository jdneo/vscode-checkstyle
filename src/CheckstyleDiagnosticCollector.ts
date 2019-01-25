import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, Disposable, languages, Range, Uri } from 'vscode';
import { ICheckstyleResult } from './models';

class CheckstyleDiagnosticCollector implements Disposable {
    private diagnosticCollection: DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = languages.createDiagnosticCollection('Checkstyle');
    }

    public addDiagnostics(uri: Uri, violations: ICheckstyleResult[]): void {
        if (violations.length === 0) {
            return;
        }
        const diagnostics: Diagnostic[] = [];
        for (const violation of violations) {
            diagnostics.push({
                range: new Range(violation.line - 1, violation.column - 1, violation.line, 0),
                message: violation.message,
                severity: this.parseDiagnosticSeverity(violation.severity),
                source: 'Checkstyle',
                code: violation.sourceName,
            });
        }
        this.diagnosticCollection.set(uri, diagnostics);
    }

    public delete(uri: Uri): void {
        this.diagnosticCollection.delete(uri);
    }

    public dispose(): void {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.clear();
            this.diagnosticCollection.dispose();
        }
    }

    private parseDiagnosticSeverity(severity: string): DiagnosticSeverity {
        switch (severity) {
            case 'INFO':
                return DiagnosticSeverity.Information;
            case 'WARNING':
                return DiagnosticSeverity.Warning;
            case 'ERROR':
            default:
                return DiagnosticSeverity.Error;
        }
    }

}

export const checkstyleDiagnosticCollector: CheckstyleDiagnosticCollector = new CheckstyleDiagnosticCollector();

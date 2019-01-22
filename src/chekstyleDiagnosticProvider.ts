import { DiagnosticCollection, Disposable, languages } from 'vscode';

class CheckstyleDiagnosticCollector implements Disposable {
    private diagnosticCollection: DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = languages.createDiagnosticCollection('Checkstyle');
    }

    public dispose(): void {
        if (this.diagnosticCollection) {
            this.diagnosticCollection.clear();
            this.diagnosticCollection.dispose();
        }
    }

}

export const checkstyleDiagnosticCollector: CheckstyleDiagnosticCollector = new CheckstyleDiagnosticCollector();

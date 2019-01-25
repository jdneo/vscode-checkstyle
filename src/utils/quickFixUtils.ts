import { Position, Range, TextEdit, Uri, WorkspaceEdit } from 'vscode';
import * as ls from 'vscode-languageserver-protocol';
import { AvailableQuickFix } from '../constants/quickFix';

export function isQuickFixAvailable(violationSourceName: string | number | undefined): boolean {
    if (violationSourceName && violationSourceName in AvailableQuickFix) {
        return true;
    }
    return false;
}

function asPosition(value: undefined | null): undefined;
function asPosition(value: ls.Position): Position;
function asPosition(value: ls.Position | undefined | null): Position | undefined;
function asPosition(value: ls.Position | undefined | null): Position | undefined {
    if (!value) {
        return undefined;
    }
    return new Position(value.line, value.character);
}

function asRange(value: undefined | null): undefined;
function asRange(value: ls.Range): Range;
function asRange(value: ls.Range | undefined | null): Range | undefined;
function asRange(value: ls.Range | undefined | null): Range | undefined {
    if (!value) {
        return undefined;
    }
    return new Range(asPosition(value.start), asPosition(value.end));
}

function asTextEdit(edit: undefined | null): undefined;
function asTextEdit(edit: ls.TextEdit): TextEdit;
function asTextEdit(edit: ls.TextEdit | undefined | null): TextEdit | undefined {
    if (!edit) {
        return undefined;
    }
    return new TextEdit(asRange(edit.range), edit.newText);
}

function asTextEdits(items: ls.TextEdit[]): TextEdit[];
function asTextEdits(items: undefined | null): undefined;
function asTextEdits(items: ls.TextEdit[] | undefined | null): TextEdit[] | undefined;
function asTextEdits(items: ls.TextEdit[] | undefined | null): TextEdit[] | undefined {
    if (!items) {
        return undefined;
    }
    return items.map(asTextEdit);
}

export function asWorkspaceEdit(item: ls.WorkspaceEdit): WorkspaceEdit;
export function asWorkspaceEdit(item: undefined | null): undefined;
export function asWorkspaceEdit(item: ls.WorkspaceEdit | undefined | null): WorkspaceEdit | undefined;
export function asWorkspaceEdit(item: ls.WorkspaceEdit | undefined | null): WorkspaceEdit | undefined {
    if (!item) {
        return undefined;
    }
    const result: WorkspaceEdit = new WorkspaceEdit();
    if (item.documentChanges) {
        item.documentChanges.forEach((change: ls.TextDocumentEdit | ls.CreateFile | ls.RenameFile | ls.DeleteFile) => {
            if (ls.CreateFile.is(change)) {
                result.createFile(Uri.parse(change.uri), change.options);
            } else if (ls.RenameFile.is(change)) {
                result.renameFile(Uri.parse(change.oldUri), Uri.parse(change.newUri), change.options);
            } else if (ls.DeleteFile.is(change)) {
                result.deleteFile(Uri.parse(change.uri), change.options);
            } else if (ls.TextDocumentEdit.is(change)) {
                result.set(Uri.parse(change.textDocument.uri), asTextEdits(change.edits));
            } else {
                // console.error(`Unknown workspace edit change received:\n${JSON.stringify(change, undefined, 4)}`);
                // TODO: log
            }
        });
    } else if (item.changes) {
        Object.keys(item.changes).forEach((key: string) => {
            result.set(Uri.parse(key), asTextEdits(item.changes![key]));
        });
    }
    return result;
}

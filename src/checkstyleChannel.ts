import { Disposable, OutputChannel, window } from 'vscode';

class CheckstyleChannel implements Disposable {
    private readonly channel: OutputChannel = window.createOutputChannel('Checkstyle');

    public appendLine(message: string): void {
        this.channel.appendLine(message);
    }

    public show(): void {
        this.channel.show();
    }

    public dispose(): void {
        this.channel.dispose();
    }
}

export const checkstyleChannel: CheckstyleChannel = new CheckstyleChannel();

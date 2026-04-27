import * as vscode from 'vscode';
import { formatLogMessage } from './logMessages';

export class OutputLogger implements vscode.Disposable {
  private readonly channel: vscode.OutputChannel;

  constructor(channelName = 'TS Switch') {
    this.channel = vscode.window.createOutputChannel(channelName);
  }

  info(message: string): void {
    this.channel.appendLine(formatLogMessage(new Date().toISOString(), message));
  }

  lines(lines: string[]): void {
    for (const line of lines) {
      this.info(line);
    }
  }

  show(): void {
    this.channel.show(true);
  }

  dispose(): void {
    this.channel.dispose();
  }
}

import * as vscode from 'vscode';
import { getStatusLabel } from './statusLabels';
import { TypeScriptRestartStatus } from './types';

export class StatusBarController implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'tsSwitch.restartTypeScriptServer';
    this.item.tooltip = 'Restart the VS Code TypeScript server';
    this.setStatus('ready');
    this.item.show();
  }

  setStatus(status: TypeScriptRestartStatus): void {
    this.item.text = getStatusLabel(status);
  }

  dispose(): void {
    this.item.dispose();
  }
}

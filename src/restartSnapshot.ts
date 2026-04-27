import * as vscode from 'vscode';
import { RestartSnapshot } from './logMessages';

export function collectRestartSnapshot(): RestartSnapshot {
  const activeEditor = vscode.window.activeTextEditor;
  const configuration = vscode.workspace.getConfiguration('typescript');

  return {
    activeFile: activeEditor?.document.uri.fsPath,
    activeLanguage: activeEditor?.document.languageId,
    workspaceFolders: vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [],
    tsdk: configuration.get<string>('tsdk'),
    tsserverLog: configuration.get<string>('tsserver.log', 'off')
  };
}

import * as vscode from 'vscode';
import { RestartSnapshot } from './logMessages';

/**
 * 현재 활성 에디터와 워크스페이스 설정을 수집해 재시작 컨텍스트를 구성합니다.
 * @returns 재시작 스냅샷 객체
 */
export function collectRestartSnapshot(): RestartSnapshot {
  const activeEditor = vscode.window.activeTextEditor;
  const configuration = vscode.workspace.getConfiguration('typescript');

  let diagnosticCount = 0;
  if (activeEditor) {
    const diagnostics = vscode.languages.getDiagnostics(activeEditor.document.uri);
    diagnosticCount = diagnostics.length;
  }

  return {
    activeFile: activeEditor?.document.uri.fsPath,
    activeLanguage: activeEditor?.document.languageId,
    workspaceFolders: vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [],
    tsdk: configuration.get<string>('tsdk'),
    tsserverLog: configuration.get<string>('tsserver.log', 'off'),
    diagnosticCount,
    maxTsServerMemory: configuration.get<number>('tsserver.maxTsServerMemory')
  };
}

import * as vscode from 'vscode';

/**
 * 현재 활성 파일의 TypeScript 진단 정보를 수집합니다.
 * tsconfig 포함 여부, 진단 개수, TS SDK 설정을 출력용 문자열 배열로 반환합니다.
 * @returns 진단 결과 문자열 배열
 */
export async function runDiagnostics(): Promise<string[]> {
  const editor = vscode.window.activeTextEditor;
  const lines: string[] = ['TypeScript Diagnostics:'];

  if (!editor) {
    lines.push('  Open a TypeScript or JavaScript file to inspect diagnostics.');
    return lines;
  }

  const doc = editor.document;
  const isTsJs = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(doc.languageId);

  lines.push(`  File: ${doc.uri.fsPath}`);
  lines.push(`  Language: ${doc.languageId}`);
  lines.push(`  Is TS/JS file: ${isTsJs}`);

  if (isTsJs) {
    const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
    if (folder) {
      const tsconfigUris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/tsconfig.json'),
        '**/node_modules/**',
        1
      );
      if (tsconfigUris.length === 0) {
        lines.push('  \u26A0 No tsconfig.json found in workspace.');
      } else {
        lines.push(`  tsconfig: ${tsconfigUris[0].fsPath}`);
      }
    } else {
      lines.push('  \u26A0 File is not inside a workspace folder.');
    }

    const allDiagnostics = vscode.languages.getDiagnostics(doc.uri);
    const errors = allDiagnostics.filter((d) => d.severity === vscode.DiagnosticSeverity.Error);
    const warnings = allDiagnostics.filter((d) => d.severity === vscode.DiagnosticSeverity.Warning);

    lines.push(`  Diagnostics: ${allDiagnostics.length} total, ${errors.length} errors, ${warnings.length} warnings`);

    if (errors.length > 5) {
      lines.push('  \u26A0 High number of errors detected. Possible tsconfig include/exclude issue.');
    }

    if (allDiagnostics.length === 0) {
      lines.push('  \u2714 No diagnostics detected for this file.');
    }
  }

  const tsSdk = vscode.workspace.getConfiguration('typescript').get<string>('tsdk');
  lines.push(`  TS SDK: ${tsSdk ?? 'default VS Code TypeScript'}`);

  if (tsSdk && !tsSdk.includes('node_modules')) {
    lines.push('  \u26A0 Custom TS SDK path does not look like a node_modules installation.');
  }

  return lines;
}

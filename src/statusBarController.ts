import * as vscode from 'vscode';
import { isAutoRecoveryEnabled } from './autoRecoverySettings';
import { getStatusLabel } from './statusLabels';
import { buildStatusTooltip } from './statusTooltip';
import { TypeScriptRestartStatus } from './types';

export class StatusBarController implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private lastRestartTime: string | undefined;
  private currentTsConfig: string | undefined;
  private editorChangeDisposable: vscode.Disposable | undefined;
  private configurationChangeDisposable: vscode.Disposable | undefined;
  private currentStatus: TypeScriptRestartStatus = 'ready';

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'tsSwitch.showMenu';
    this.lastRestartTime = undefined;
    this.currentTsConfig = undefined;

    this.refreshTsConfig();
    this.editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
      this.refreshTsConfig();
    });
    this.configurationChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration('tsSwitch.autoRecovery') ||
        event.affectsConfiguration('tsSwitch.autoRestart') ||
        event.affectsConfiguration('tsSwitch.smartRestart')
      ) {
        this.updateText();
        this.updateTooltip();
      }
    });

    this.updateTooltip();
    this.setStatus('ready');
    this.item.show();
  }

  /**
   * 현재 활성 파일 또는 워크스페이스 기준으로 tsconfig.json 경로를 갱신합니다.
   */
  private async refreshTsConfig(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const folder = editor
      ? vscode.workspace.getWorkspaceFolder(editor.document.uri)
      : vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
      this.currentTsConfig = undefined;
      this.updateTooltip();
      return;
    }

    const pattern = new vscode.RelativePattern(folder, '**/tsconfig.json');
    const uris = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    this.currentTsConfig = uris[0]?.fsPath;
    this.updateTooltip();
  }

  /**
   * 상태 표시줄 아이템의 툴팁을 업데이트합니다.
   * TS SDK 설정, tsconfig 경로, 마지막 재시작 시간을 포함합니다.
   */
  private updateTooltip(): void {
    const tsSdk = vscode.workspace.getConfiguration('typescript').get<string>('tsdk');
    const config = vscode.workspace.getConfiguration('tsSwitch');
    const autoRecoveryEnabled = isAutoRecoveryEnabled({
      autoRecovery: config.get<boolean | undefined>('autoRecovery'),
      autoRestart: config.get<boolean | undefined>('autoRestart'),
      smartRestart: config.get<boolean | undefined>('smartRestart'),
    });
    const editor = vscode.window.activeTextEditor;
    const diagnosticCount = editor
      ? vscode.languages.getDiagnostics(editor.document.uri).length
      : undefined;

    this.item.tooltip = buildStatusTooltip({
      tsSdk,
      autoRecoveryEnabled,
      diagnosticCount,
      currentTsConfig: this.currentTsConfig,
      lastRestartTime: this.lastRestartTime,
    });
  }

  private updateText(): void {
    const config = vscode.workspace.getConfiguration('tsSwitch');
    this.item.text = getStatusLabel(this.currentStatus, {
      autoRecovery: isAutoRecoveryEnabled({
        autoRecovery: config.get<boolean | undefined>('autoRecovery'),
        autoRestart: config.get<boolean | undefined>('autoRestart'),
        smartRestart: config.get<boolean | undefined>('smartRestart'),
      }),
    });
  }

  /**
   * 상태 표시줄의 텍스트와 배경색을 업데이트합니다.
   * error 상태면 오류 배경, restarted 상태면 경고 배경을 적용합니다.
   * @param status 변경할 재시작 상태
   */
  setStatus(status: TypeScriptRestartStatus): void {
    this.currentStatus = status;
    this.updateText();

    if (status === 'error') {
      this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (status === 'restarted') {
      this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.item.backgroundColor = undefined;
    }

    if (status === 'restarted' || status === 'error') {
      this.lastRestartTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\./g, '-');
      this.updateTooltip();
    } else if (status === 'ready') {
      this.updateTooltip();
    }
  }

  dispose(): void {
    this.item.dispose();
    this.editorChangeDisposable?.dispose();
    this.configurationChangeDisposable?.dispose();
  }
}

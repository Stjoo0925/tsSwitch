import * as vscode from 'vscode';
import { getStatusLabel } from './statusLabels';
import { TypeScriptRestartStatus } from './types';

export class StatusBarController implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private lastRestartTime: string | undefined;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'tsSwitch.restartTypeScriptServer';
    this.lastRestartTime = undefined;
    this.updateTooltip();
    this.setStatus('ready');
    this.item.show();
  }

  /**
   * 상태 표시줄 아이템의 툴팁을 업데이트합니다.
   * 마지막 재시작 시간이 있으면 툴팁에 포함하여 표시합니다.
   */
  private updateTooltip(): void {
    const baseTooltip = 'VS Code TypeScript 서버를 재시작합니다';
    if (this.lastRestartTime) {
      this.item.tooltip = `${baseTooltip}\n\n마지막 재시작: ${this.lastRestartTime}`;
    } else {
      this.item.tooltip = baseTooltip;
    }
  }

  /**
   * 상태 표시줄의 텍스트와 배경색을 업데이트합니다.
   * error 상태면 빨간색, restarted 상태면 노란색 배경을 적용합니다.
   * @param status 변경할 재시작 상태
   */
  setStatus(status: TypeScriptRestartStatus): void {
    this.item.text = getStatusLabel(status);

    if (status === 'error') {
      this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (status === 'restarted') {
      this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.item.backgroundColor = undefined;
    }

    if (status === 'restarted' || status === 'error') {
      this.lastRestartTime = new Date().toLocaleString('ko-KR', {
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
  }
}

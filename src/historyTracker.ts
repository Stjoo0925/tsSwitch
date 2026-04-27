import * as vscode from 'vscode';
import { RestartHistoryEntry } from './types';

const HISTORY_KEY = 'tsSwitch.restartHistory';
const MAX_HISTORY_SIZE = 50;

/**
 * globalState에 재시작 이력을 저장하고 조회합니다.
 */
export class HistoryTracker {
  constructor(private readonly globalState: vscode.Memento) { }

  /**
   * 재시작 결과를 이력에 추가합니다.
   * 최대 개수를 초과하면 오래된 항목부터 제거합니다.
   * @param entry 저장할 재시작 이력 항목
   */
  async add(entry: RestartHistoryEntry): Promise<void> {
    const history = this.getAll();
    history.unshift(entry);
    if (history.length > MAX_HISTORY_SIZE) {
      history.length = MAX_HISTORY_SIZE;
    }
    await this.globalState.update(HISTORY_KEY, history);
  }

  /**
   * 저장된 모든 재시작 이력을 최신순으로 반환합니다.
   * @returns 재시작 이력 배열
   */
  getAll(): RestartHistoryEntry[] {
    return this.globalState.get<RestartHistoryEntry[]>(HISTORY_KEY, []);
  }

  /**
   * 저장된 이력을 OutputChannel에 쓰기 좋은 문자열 배열로 변환합니다.
   * @returns 출력용으로 포맷된 문자열 배열
   */
  formatHistory(): string[] {
    const history = this.getAll();
    if (history.length === 0) {
      return ['No restart history.'];
    }

    const lines: string[] = [`Total ${history.length} restart(s)`, ''];
    for (const entry of history) {
      const date = new Date(entry.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const statusLabel = entry.status === 'success' ? 'success' : 'error';
      lines.push(`[${date}] ${statusLabel}`);
      if (entry.activeFile) {
        lines.push(`  File: ${entry.activeFile}`);
      }
      if (entry.activeLanguage) {
        lines.push(`  Language: ${entry.activeLanguage}`);
      }
      lines.push(`  Diagnostics: ${entry.diagnosticCount ?? 0}`);
      if (entry.tsdk) {
        lines.push(`  TS SDK: ${entry.tsdk}`);
      }
      if (entry.maxTsServerMemory) {
        lines.push(`  Max memory: ${entry.maxTsServerMemory} MB`);
      }
      lines.push(`  Log: ${entry.tsserverLog}`);
      lines.push('');
    }
    return lines;
  }
}

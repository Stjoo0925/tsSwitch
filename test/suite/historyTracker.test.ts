import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HistoryTracker } from '../../src/historyTracker';
import { RestartHistoryEntry } from '../../src/types';

class MockMemento {
  private data = new Map<string, unknown>();

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.data.has(key) ? (this.data.get(key) as T) : defaultValue;
  }

  async update<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }
}

function createEntry(timestamp: string, status: 'success' | 'error'): RestartHistoryEntry {
  return {
    timestamp,
    status,
    activeFile: '/test/file.ts',
    activeLanguage: 'typescript',
    tsdk: undefined,
    tsserverLog: 'off',
    diagnosticCount: 0,
    maxTsServerMemory: undefined,
  };
}

describe('history tracker', () => {
  it('adds and retrieves a single entry', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    const entry = createEntry('2026-04-27T12:00:00.000Z', 'success');
    await tracker.add(entry);

    const all = tracker.getAll();
    assert.equal(all.length, 1);
    assert.equal(all[0].status, 'success');
    assert.equal(all[0].activeFile, '/test/file.ts');
  });

  it('stores entries in reverse chronological order', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    await tracker.add(createEntry('2026-04-27T12:00:00.000Z', 'success'));
    await tracker.add(createEntry('2026-04-27T12:01:00.000Z', 'error'));

    const all = tracker.getAll();
    assert.equal(all.length, 2);
    assert.equal(all[0].status, 'error');
    assert.equal(all[1].status, 'success');
  });

  it('caps history at 50 entries', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    for (let i = 0; i < 55; i++) {
      await tracker.add(createEntry(`2026-04-27T12:${String(i).padStart(2, '0')}:00.000Z`, 'success'));
    }

    const all = tracker.getAll();
    assert.equal(all.length, 50);
  });

  it('formats empty history', () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    const lines = tracker.formatHistory();
    assert.equal(lines.length, 1);
    assert.equal(lines[0], 'No restart history.');
  });

  it('formats history with entries', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    await tracker.add(createEntry('2026-04-27T12:00:00.000Z', 'success'));
    const lines = tracker.formatHistory();

    assert.ok(lines[0].includes('1 restart(s)'));
    assert.ok(lines[1] === '');
    assert.ok(lines[2].includes('success'));
    assert.ok(lines[3].includes('/test/file.ts'));
    assert.ok(lines[4].includes('typescript'));
    assert.ok(lines[5].includes('0'));
  });

  it('omits optional detail lines when history entry has no values', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker = new HistoryTracker(memento);

    await tracker.add({
      timestamp: '2026-04-27T12:00:00.000Z',
      status: 'success',
      activeFile: undefined,
      activeLanguage: undefined,
      tsdk: undefined,
      tsserverLog: 'off',
      diagnosticCount: 0,
      maxTsServerMemory: undefined,
    });

    const lines = tracker.formatHistory();
    assert.equal(lines.some((line) => line.includes('none')), false);
    assert.equal(lines.some((line) => line.startsWith('  File:')), false);
    assert.equal(lines.some((line) => line.startsWith('  Language:')), false);
    assert.equal(lines.some((line) => line.includes('default')), false);
  });

  it('persists across tracker instances', async () => {
    const memento = new MockMemento() as unknown as import('vscode').Memento;
    const tracker1 = new HistoryTracker(memento);

    await tracker1.add(createEntry('2026-04-27T12:00:00.000Z', 'error'));

    const tracker2 = new HistoryTracker(memento);
    const all = tracker2.getAll();
    assert.equal(all.length, 1);
    assert.equal(all[0].status, 'error');
  });
});

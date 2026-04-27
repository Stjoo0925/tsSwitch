import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatLogMessage, formatInitializationSnapshot, RestartSnapshot } from '../../src/logMessages';

describe('log messages', () => {
  it('formats log message with timestamp', () => {
    const result = formatLogMessage('2026-04-27T12:00:00.000Z', 'Test message');
    assert.equal(result, '[2026-04-27T12:00:00.000Z] Test message');
  });

  it('formats initialization snapshot with all fields', () => {
    const snapshot: RestartSnapshot = {
      activeFile: '/test/file.ts',
      activeLanguage: 'typescript',
      workspaceFolders: ['/workspace'],
      tsdk: '/custom/tsdk',
      tsserverLog: 'verbose',
      diagnosticCount: 5,
      maxTsServerMemory: 8192,
    };
    const result = formatInitializationSnapshot(snapshot);
    assert.equal(result.length, 9);
    assert.equal(result[0], 'TypeScript restart context:');
    assert.ok(result[1].includes('/test/file.ts'));
    assert.ok(result[2].includes('typescript'));
    assert.ok(result[3].includes('/workspace'));
    assert.ok(result[4].includes('/custom/tsdk'));
    assert.equal(result[5], '  typescript.tsserver.log: verbose');
    assert.equal(result[6], '  Diagnostics count: 5');
    assert.ok(result[7].includes('8192'));
  });

  it('formats initialization snapshot with missing optional fields', () => {
    const snapshot: RestartSnapshot = {
      activeFile: undefined,
      activeLanguage: undefined,
      workspaceFolders: [],
      tsdk: undefined,
      tsserverLog: 'off',
      diagnosticCount: 0,
      maxTsServerMemory: undefined,
    };
    const result = formatInitializationSnapshot(snapshot);
    assert.equal(result.length, 6);
    assert.equal(result.some((line) => line.includes('Active file')), false);
    assert.equal(result.some((line) => line.includes('Active language')), false);
    assert.equal(result.some((line) => line.includes('none')), false);
    assert.equal(result[1], '  Workspace folders: 0');
    assert.equal(result[2], '  typescript.tsserver.log: off');
    assert.equal(result[3], '  Diagnostics count: 0');
    assert.equal(result[4], '  Max TS server memory: default');
  });

  it('shows different message when tsserver log is off', () => {
    const snapshotOff: RestartSnapshot = {
      activeFile: '/test/file.ts',
      activeLanguage: 'typescript',
      workspaceFolders: ['/workspace'],
      tsdk: undefined,
      tsserverLog: 'off',
      diagnosticCount: 0,
      maxTsServerMemory: undefined,
    };
    const resultOff = formatInitializationSnapshot(snapshotOff);
    assert.ok(resultOff[resultOff.length - 1].includes('set "typescript.tsserver.log" to "verbose"'));

    const snapshotOn: RestartSnapshot = {
      activeFile: '/test/file.ts',
      activeLanguage: 'typescript',
      workspaceFolders: ['/workspace'],
      tsdk: undefined,
      tsserverLog: 'verbose',
      diagnosticCount: 0,
      maxTsServerMemory: undefined,
    };
    const resultOn = formatInitializationSnapshot(snapshotOn);
    assert.ok(resultOn[resultOn.length - 1].includes('use "TS Switch: Open TypeScript Server Log"'));
  });

  it('handles multiple workspace folders', () => {
    const snapshot: RestartSnapshot = {
      activeFile: '/test/file.ts',
      activeLanguage: 'typescript',
      workspaceFolders: ['/workspace1', '/workspace2', '/workspace3'],
      tsdk: undefined,
      tsserverLog: 'off',
      diagnosticCount: 0,
      maxTsServerMemory: undefined,
    };
    const result = formatInitializationSnapshot(snapshot);
    assert.ok(result[3].includes('/workspace1'));
    assert.ok(result[3].includes('/workspace2'));
    assert.ok(result[3].includes('/workspace3'));
  });
});

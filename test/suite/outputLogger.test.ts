import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatInitializationSnapshot, formatLogMessage, RestartSnapshot } from '../../src/logMessages';

describe('output logger', () => {
  it('formats restart lifecycle messages with an ISO timestamp and scope', () => {
    const message = formatLogMessage('2026-04-27T12:34:56.789Z', 'Restart requested');

    assert.equal(message, '[2026-04-27T12:34:56.789Z] Restart requested');
  });

  it('formats the TypeScript restart environment snapshot', () => {
    const snapshot: RestartSnapshot = {
      activeFile: 'C:\\workspace\\src\\App.tsx',
      activeLanguage: 'typescriptreact',
      workspaceFolders: ['C:\\workspace'],
      tsdk: './node_modules/typescript/lib',
      tsserverLog: 'verbose',
      diagnosticCount: 3,
      maxTsServerMemory: 3072
    };

    assert.deepEqual(formatInitializationSnapshot(snapshot), [
      'TypeScript restart context:',
      '  Active file: C:\\workspace\\src\\App.tsx',
      '  Active language: typescriptreact',
      '  Workspace folders: C:\\workspace',
      '  typescript.tsdk: ./node_modules/typescript/lib',
      '  typescript.tsserver.log: verbose',
      '  Diagnostics count: 3',
      '  Max TS server memory: 3072',
      '  TS server internals: use "TS Switch: Open TypeScript Server Log" for VS Code tsserver initialization details.'
    ]);
  });

  it('omits missing restart context values', () => {
    const snapshot: RestartSnapshot = {
      activeFile: undefined,
      activeLanguage: undefined,
      workspaceFolders: [],
      tsdk: undefined,
      tsserverLog: 'off',
      diagnosticCount: 0,
      maxTsServerMemory: undefined
    };

    assert.deepEqual(formatInitializationSnapshot(snapshot), [
      'TypeScript restart context:',
      '  Workspace folders: 0',
      '  typescript.tsserver.log: off',
      '  Diagnostics count: 0',
      '  Max TS server memory: default',
      '  TS server internals: set "typescript.tsserver.log" to "verbose", then use "TS Switch: Open TypeScript Server Log".'
    ]);
  });
});

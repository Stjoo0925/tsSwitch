import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const extensionSource = readFileSync('src/extension.ts', 'utf8');

describe('extension menu', () => {
  it('does not expose reload projects as a separate quick pick action', () => {
    assert.equal(extensionSource.includes('Reload TS Projects'), false);
  });

  it('keeps project reload integrated into restart', () => {
    assert.equal(extensionSource.includes("executeCommand('typescript.reloadProjects')"), true);
  });
});

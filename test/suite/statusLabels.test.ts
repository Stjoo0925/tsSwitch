import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getStatusLabel } from '../../src/statusLabels';

describe('status labels', () => {
  it('renders the ready label as a direct TypeScript restart action', () => {
    assert.equal(getStatusLabel('ready'), '$(debug-restart) TS: Restart');
  });

  it('renders restart progress and result labels', () => {
    assert.equal(getStatusLabel('restarting'), '$(sync~spin) TS: Restarting');
    assert.equal(getStatusLabel('restarted'), '$(check) TS: Restarted');
    assert.equal(getStatusLabel('error'), '$(error) TS: Error');
  });
});

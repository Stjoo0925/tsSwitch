import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getStatusLabel } from '../../src/statusLabels';

describe('status labels', () => {
  it('renders the ready label as a direct TypeScript restart action', () => {
    assert.equal(getStatusLabel('ready'), '$(check) TS Ready');
  });

  it('renders restart progress and result labels', () => {
    assert.equal(getStatusLabel('restarting'), '$(sync~spin) TS Restarting');
    assert.equal(getStatusLabel('restarted'), '$(check) TS Restarted');
    assert.equal(getStatusLabel('error'), '$(warning) TS Error');
    assert.equal(getStatusLabel('auto'), '$(tools) TS Recovery');
  });

  it('renders enabled auto recovery indicator on ready status', () => {
    assert.equal(getStatusLabel('ready', { autoRecovery: true }), '$(check) TS Ready [Recovery]');
  });
});

import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAutoRecoveryEnabled } from '../../src/autoRecoverySettings';

describe('auto recovery settings', () => {
  it('uses the unified autoRecovery setting when present', () => {
    assert.equal(isAutoRecoveryEnabled({ autoRecovery: true, autoRestart: false, smartRestart: false }), true);
    assert.equal(isAutoRecoveryEnabled({ autoRecovery: false, autoRestart: true, smartRestart: true }), false);
  });

  it('treats legacy autoRestart or smartRestart as enabled when autoRecovery is not set', () => {
    assert.equal(isAutoRecoveryEnabled({ autoRestart: true, smartRestart: false }), true);
    assert.equal(isAutoRecoveryEnabled({ autoRestart: false, smartRestart: true }), true);
    assert.equal(isAutoRecoveryEnabled({ autoRestart: false, smartRestart: false }), false);
  });
});

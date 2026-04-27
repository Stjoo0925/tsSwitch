import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldReloadWindowAfterRestart } from '../../src/restartSettings';

describe('restart settings', () => {
  it('uses the renamed reloadWindowAfterRestart setting when present', () => {
    assert.equal(shouldReloadWindowAfterRestart({
      reloadWindowAfterRestart: true,
      fixIncludesReloadWindow: false,
    }), true);
    assert.equal(shouldReloadWindowAfterRestart({
      reloadWindowAfterRestart: false,
      fixIncludesReloadWindow: true,
    }), false);
  });

  it('keeps compatibility with the old fixIncludesReloadWindow setting', () => {
    assert.equal(shouldReloadWindowAfterRestart({ fixIncludesReloadWindow: true }), true);
    assert.equal(shouldReloadWindowAfterRestart({ fixIncludesReloadWindow: false }), false);
  });
});

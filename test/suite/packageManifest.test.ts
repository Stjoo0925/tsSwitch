import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));

describe('package manifest', () => {
  it('contributes only the simplified command surface', () => {
    const commands = manifest.contributes.commands.map((item: { command: string }) => item.command);

    assert.deepEqual(commands, [
      'tsSwitch.restartTypeScriptServer',
      'tsSwitch.showMenu',
    ]);
  });

  it('does not expose the removed fix-all keybinding', () => {
    const keybindings = manifest.contributes.keybindings.map((item: { command: string }) => item.command);

    assert.deepEqual(keybindings, ['tsSwitch.restartTypeScriptServer']);
  });

  it('contributes one auto recovery setting instead of separate auto and smart restart settings', () => {
    const properties = manifest.contributes.configuration.properties;

    assert.equal(Boolean(properties['tsSwitch.autoRecovery']), true);
    assert.equal(Boolean(properties['tsSwitch.autoRestart']), false);
    assert.equal(Boolean(properties['tsSwitch.smartRestart']), false);
  });

  it('uses reloadWindowAfterRestart instead of the old fix all option name', () => {
    const properties = manifest.contributes.configuration.properties;

    assert.equal(Boolean(properties['tsSwitch.reloadWindowAfterRestart']), true);
    assert.equal(Boolean(properties['tsSwitch.fixIncludesReloadWindow']), false);
  });
});

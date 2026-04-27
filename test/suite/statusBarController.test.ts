import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildStatusTooltip } from '../../src/statusTooltip';

describe('status bar controller tooltip', () => {
  it('does not render a blank TS SDK value', () => {
    const tooltip = buildStatusTooltip({
      tsSdk: '',
      autoRecoveryEnabled: false,
      diagnosticCount: undefined,
      currentTsConfig: undefined,
      lastRestartTime: undefined,
    });

    assert.equal(tooltip.includes('TS SDK:'), false);
  });

  it('renders tsconfig when it is known without requiring diagnostics from an active editor', () => {
    const tooltip = buildStatusTooltip({
      tsSdk: undefined,
      autoRecoveryEnabled: false,
      diagnosticCount: undefined,
      currentTsConfig: 'C:\\workspace\\tsconfig.json',
      lastRestartTime: undefined,
    });

    assert.equal(tooltip.includes('tsconfig: C:\\workspace\\tsconfig.json'), true);
    assert.equal(tooltip.includes('Diagnostics:'), false);
  });

  it('renders one auto recovery setting instead of separate auto and smart settings', () => {
    const tooltip = buildStatusTooltip({
      tsSdk: undefined,
      autoRecoveryEnabled: true,
      diagnosticCount: undefined,
      currentTsConfig: undefined,
      lastRestartTime: undefined,
    });

    assert.equal(tooltip.includes('Auto recovery: On'), true);
    assert.equal(tooltip.includes('Auto restart:'), false);
    assert.equal(tooltip.includes('Smart restart:'), false);
  });
});

export interface StatusTooltipOptions {
  tsSdk: string | undefined;
  autoRecoveryEnabled: boolean;
  diagnosticCount: number | undefined;
  currentTsConfig: string | undefined;
  lastRestartTime: string | undefined;
}

export function buildStatusTooltip(options: StatusTooltipOptions): string {
  const lines = ['Restart the VS Code TypeScript server', ''];
  const tsSdk = options.tsSdk?.trim();

  if (tsSdk) {
    lines.push(`TS SDK: ${tsSdk}`);
  }
  lines.push(`Auto recovery: ${options.autoRecoveryEnabled ? 'On' : 'Off'}`);
  if (options.diagnosticCount !== undefined) {
    lines.push(`Diagnostics: ${options.diagnosticCount}`);
  }
  if (options.currentTsConfig) {
    lines.push(`tsconfig: ${options.currentTsConfig}`);
  }
  if (options.lastRestartTime) {
    lines.push('', `Last restart: ${options.lastRestartTime}`);
  }

  return lines.join('\n');
}

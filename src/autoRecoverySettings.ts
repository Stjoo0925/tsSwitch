export interface AutoRecoverySettings {
  autoRecovery?: boolean;
  autoRestart?: boolean;
  smartRestart?: boolean;
}

export function isAutoRecoveryEnabled(settings: AutoRecoverySettings): boolean {
  if (settings.autoRecovery !== undefined) {
    return settings.autoRecovery;
  }

  return Boolean(settings.autoRestart || settings.smartRestart);
}

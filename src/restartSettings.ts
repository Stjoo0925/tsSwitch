export interface RestartSettings {
  reloadWindowAfterRestart?: boolean;
  fixIncludesReloadWindow?: boolean;
}

export function shouldReloadWindowAfterRestart(settings: RestartSettings): boolean {
  if (settings.reloadWindowAfterRestart !== undefined) {
    return settings.reloadWindowAfterRestart;
  }

  return Boolean(settings.fixIncludesReloadWindow);
}

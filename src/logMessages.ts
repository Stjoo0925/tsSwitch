export function formatLogMessage(timestamp: string, message: string): string {
  return `[${timestamp}] ${message}`;
}

export interface RestartSnapshot {
  activeFile: string | undefined;
  activeLanguage: string | undefined;
  workspaceFolders: string[];
  tsdk: string | undefined;
  tsserverLog: string;
}

export function formatInitializationSnapshot(snapshot: RestartSnapshot): string[] {
  return [
    'TypeScript restart context:',
    `  Active file: ${snapshot.activeFile ?? 'none'}`,
    `  Active language: ${snapshot.activeLanguage ?? 'none'}`,
    `  Workspace folders: ${snapshot.workspaceFolders.length > 0 ? snapshot.workspaceFolders.join(', ') : 'none'}`,
    `  typescript.tsdk: ${snapshot.tsdk || 'default VS Code TypeScript'}`,
    `  typescript.tsserver.log: ${snapshot.tsserverLog}`,
    snapshot.tsserverLog === 'off'
      ? '  TS server internals: set "typescript.tsserver.log" to "verbose", then use "TS Switch: Open TypeScript Server Log".'
      : '  TS server internals: use "TS Switch: Open TypeScript Server Log" for VS Code tsserver initialization details.'
  ];
}

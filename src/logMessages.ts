export function formatLogMessage(timestamp: string, message: string): string {
  return `[${timestamp}] ${message}`;
}

export interface RestartSnapshot {
  activeFile: string | undefined;
  activeLanguage: string | undefined;
  workspaceFolders: string[];
  tsdk: string | undefined;
  tsserverLog: string;
  diagnosticCount: number;
  maxTsServerMemory: number | undefined;
}

export function formatInitializationSnapshot(snapshot: RestartSnapshot): string[] {
  const lines = [
    'TypeScript restart context:',
  ];

  if (snapshot.activeFile) {
    lines.push(`  Active file: ${snapshot.activeFile}`);
  }
  if (snapshot.activeLanguage) {
    lines.push(`  Active language: ${snapshot.activeLanguage}`);
  }
  lines.push(
    `  Workspace folders: ${snapshot.workspaceFolders.length > 0 ? snapshot.workspaceFolders.join(', ') : '0'}`,
  );
  if (snapshot.tsdk) {
    lines.push(`  typescript.tsdk: ${snapshot.tsdk}`);
  }
  lines.push(
    `  typescript.tsserver.log: ${snapshot.tsserverLog}`,
    `  Diagnostics count: ${snapshot.diagnosticCount}`,
    `  Max TS server memory: ${snapshot.maxTsServerMemory ?? 'default'}`,
    snapshot.tsserverLog === 'off'
      ? '  TS server internals: set "typescript.tsserver.log" to "verbose", then use "TS Switch: Open TypeScript Server Log".'
      : '  TS server internals: use "TS Switch: Open TypeScript Server Log" for VS Code tsserver initialization details.'
  );
  return lines;
}

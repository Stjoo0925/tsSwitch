import * as vscode from 'vscode';
import { isAutoRecoveryEnabled } from './autoRecoverySettings';
import { runDiagnostics } from './diagnostics';
import { formatInitializationSnapshot } from './logMessages';
import { HistoryTracker } from './historyTracker';
import { OutputLogger } from './outputLogger';
import { collectRestartSnapshot } from './restartSnapshot';
import { shouldReloadWindowAfterRestart } from './restartSettings';
import { StatusBarController } from './statusBarController';

/**
 * 현재 활성 에디터를 통해 TypeScript 서버가 응답하는지 확인합니다.
 * 3초 안에 hover provider 결과를 받으면 정상으로 간주합니다.
 * @returns TS 서버가 응답하면 true, 그렇지 않으면 false
 */
async function pingTypeScriptServer(): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }

  try {
    await Promise.race([
      vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        editor.document.uri,
        new vscode.Position(0, 0)
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('ping timeout')), 3000)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = new StatusBarController();
  const logger = new OutputLogger();
  const history = new HistoryTracker(context.globalState);

  let autoRecoveryTimeout: NodeJS.Timeout | undefined;

  function getAutoRecoveryEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('tsSwitch');
    return isAutoRecoveryEnabled({
      autoRecovery: config.get<boolean | undefined>('autoRecovery'),
      autoRestart: config.get<boolean | undefined>('autoRestart'),
      smartRestart: config.get<boolean | undefined>('smartRestart'),
    });
  }

  function debouncedAutoRestart(): void {
    if (autoRecoveryTimeout) {
      clearTimeout(autoRecoveryTimeout);
    }
    autoRecoveryTimeout = setTimeout(() => {
      void runFileChangeRecovery();
    }, 1000);
  }

  async function runFileChangeRecovery(): Promise<void> {
    if (!getAutoRecoveryEnabled()) {
      return;
    }
    logger.info('Auto recovery triggered by file change');
    try {
      await vscode.commands.executeCommand('tsSwitch.restartTypeScriptServer', { source: 'autoRecovery' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      logger.info(`Auto recovery failed: ${message}`);
    }
    setTimeout(() => statusBar.setStatus('ready'), 2000);
  }

  const tsconfigWatcher = vscode.workspace.createFileSystemWatcher('**/tsconfig.json');
  const packageJsonWatcher = vscode.workspace.createFileSystemWatcher('**/package.json');
  const tsPackageWatcher = vscode.workspace.createFileSystemWatcher('**/node_modules/typescript/package.json');

  tsconfigWatcher.onDidChange(debouncedAutoRestart);
  packageJsonWatcher.onDidChange(debouncedAutoRestart);
  tsPackageWatcher.onDidChange(debouncedAutoRestart);

  let lastErrorCount = 0;
  let recoveryDiagnosticTimeout: NodeJS.Timeout | undefined;

  function handleSmartDiagnostics(): void {
    if (recoveryDiagnosticTimeout) {
      clearTimeout(recoveryDiagnosticTimeout);
    }
    recoveryDiagnosticTimeout = setTimeout(() => {
      void runDiagnosticRecovery();
    }, 3000);
  }

  async function runDiagnosticRecovery(): Promise<void> {
    if (!getAutoRecoveryEnabled()) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      lastErrorCount = 0;
      return;
    }

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const errors = diagnostics.filter((d) => d.severity === vscode.DiagnosticSeverity.Error).length;

    if (lastErrorCount > 0 && errors - lastErrorCount >= 10) {
      logger.info(`Auto recovery triggered: error count spiked (${lastErrorCount} -> ${errors})`);
      try {
        await vscode.commands.executeCommand('tsSwitch.restartTypeScriptServer', { source: 'autoRecovery' });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        logger.info(`Auto recovery failed: ${message}`);
      }
      setTimeout(() => statusBar.setStatus('ready'), 2000);
    }

    lastErrorCount = errors;
  }

  const diagnosticChangeDisposable = vscode.languages.onDidChangeDiagnostics(handleSmartDiagnostics);

  const smartPingInterval = setInterval(() => {
    void runResponsivenessRecovery();
  }, 30000);

  async function runResponsivenessRecovery(): Promise<void> {
    if (!getAutoRecoveryEnabled()) {
      return;
    }

    logger.info('Auto recovery ping: checking TS server responsiveness');
    const isAlive = await pingTypeScriptServer();
    if (!isAlive) {
      logger.info('Auto recovery triggered: TS server unresponsive');
      try {
        await vscode.commands.executeCommand('tsSwitch.restartTypeScriptServer', { source: 'autoRecovery' });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        logger.info(`Auto recovery failed: ${message}`);
      }
      setTimeout(() => statusBar.setStatus('ready'), 2000);
    }
  }

  context.subscriptions.push(
    tsconfigWatcher,
    packageJsonWatcher,
    tsPackageWatcher,
    statusBar,
    logger,
    vscode.commands.registerCommand('tsSwitch.restartTypeScriptServer', async (options?: { source?: 'manual' | 'autoRecovery' }) => {
      const isAutoRecovery = options?.source === 'autoRecovery';
      statusBar.setStatus(isAutoRecovery ? 'auto' : 'restarting');
      logger.info('Restart requested');
      const snapshot = collectRestartSnapshot();
      logger.lines(formatInitializationSnapshot(snapshot));

      try {
        await vscode.commands.executeCommand('typescript.restartTsServer');
        logger.info('Reloading TS projects');
        await vscode.commands.executeCommand('typescript.reloadProjects');
        logger.info('TS projects reloaded');

        const config = vscode.workspace.getConfiguration('tsSwitch');
        if (shouldReloadWindowAfterRestart({
          reloadWindowAfterRestart: config.get<boolean | undefined>('reloadWindowAfterRestart'),
          fixIncludesReloadWindow: config.get<boolean | undefined>('fixIncludesReloadWindow'),
        })) {
          logger.info('Reloading VS Code window after restart flow');
          await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }

        statusBar.setStatus('restarted');
        logger.info('Restart completed');
        setTimeout(() => statusBar.setStatus('ready'), 2000);
        await history.add({
          timestamp: new Date().toISOString(),
          status: 'success',
          activeFile: snapshot.activeFile,
          activeLanguage: snapshot.activeLanguage,
          tsdk: snapshot.tsdk,
          tsserverLog: snapshot.tsserverLog,
          diagnosticCount: snapshot.diagnosticCount,
          maxTsServerMemory: snapshot.maxTsServerMemory,
        });
      } catch (error) {
        statusBar.setStatus('error');
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.info(`Restart failed: ${message}`);
        logger.show();
        vscode.window.showErrorMessage(`Failed to restart TypeScript server: ${message}`);
        await history.add({
          timestamp: new Date().toISOString(),
          status: 'error',
          activeFile: snapshot.activeFile,
          activeLanguage: snapshot.activeLanguage,
          tsdk: snapshot.tsdk,
          tsserverLog: snapshot.tsserverLog,
          diagnosticCount: snapshot.diagnosticCount,
          maxTsServerMemory: snapshot.maxTsServerMemory,
        });
      }
    }),
    vscode.commands.registerCommand('tsSwitch.showMenu', async () => {
      const pick = await vscode.window.showQuickPick(
        [
          { label: '$(debug-restart) Restart TS Server', description: 'Restart TS server and reload project configurations' },
          { label: '$(settings) Open Settings', description: 'Open TS Switch settings' },
          { label: '$(output) Open Output', description: 'Show TS Switch output channel' },
        ],
        { placeHolder: 'TS Switch: Select an action' }
      );
      if (!pick) { return; }
      if (pick.label.includes('Restart TS Server')) {
        await vscode.commands.executeCommand('tsSwitch.restartTypeScriptServer');
      } else if (pick.label.includes('Open Settings')) {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'tsSwitch');
      } else if (pick.label.includes('Open Output')) {
        logger.lines(history.formatHistory());
        logger.lines(await runDiagnostics());
        logger.show();
      }
    }),
    diagnosticChangeDisposable,
    { dispose: () => clearInterval(smartPingInterval) }
  );
}

export function deactivate(): void { }

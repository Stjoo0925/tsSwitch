import * as vscode from 'vscode';
import { formatInitializationSnapshot } from './logMessages';
import { OutputLogger } from './outputLogger';
import { collectRestartSnapshot } from './restartSnapshot';
import { StatusBarController } from './statusBarController';

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = new StatusBarController();
  const logger = new OutputLogger();

  context.subscriptions.push(
    statusBar,
    logger,
    vscode.commands.registerCommand('tsSwitch.restartTypeScriptServer', async () => {
      statusBar.setStatus('restarting');
      logger.info('Restart requested');
      logger.lines(formatInitializationSnapshot(collectRestartSnapshot()));

      try {
        await vscode.commands.executeCommand('typescript.restartTsServer');
        statusBar.setStatus('restarted');
        logger.info('Restart completed');
        setTimeout(() => statusBar.setStatus('ready'), 2000);
      } catch (error) {
        statusBar.setStatus('error');
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.info(`Restart failed: ${message}`);
        logger.show();
        vscode.window.showErrorMessage(`Failed to restart TypeScript server: ${message}`);
      }
    }),
    vscode.commands.registerCommand('tsSwitch.openTypeScriptServerLog', async () => {
      logger.info('Opening VS Code TypeScript server log');
      await vscode.commands.executeCommand('typescript.openTsServerLog');
    })
  );
}

export function deactivate(): void {}

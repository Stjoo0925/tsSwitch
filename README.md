# TS Switch

TS Switch is a small VS Code extension for recovering TypeScript language features from the status bar.

Use it when IntelliSense, type checking, imports, hover, or TS/JS navigation gets stuck and you would normally run TypeScript recovery commands from the command palette.

## Features

- Restart the VS Code TypeScript server from the status bar
- Reload TypeScript project configurations as part of the restart flow
- Optional auto recovery for config changes, error spikes, and an unresponsive TS server
- Restart history, diagnostics, and context details in the TS Switch output channel
- Status bar tooltip with TS SDK, tsconfig, diagnostics, auto recovery, and last restart information

## Usage

1. Open a TypeScript, TSX, JavaScript, or JSX workspace.
2. Click the TS Switch status bar item.
3. Choose `Restart TS Server`.

`Restart TS Server` runs both:

- `typescript.restartTsServer`
- `typescript.reloadProjects`

## Quick Pick

- `Restart TS Server`: restart the TS server and reload project configurations
- `Open Settings`: open TS Switch settings
- `Open Output`: show restart history and diagnostics in the TS Switch output channel

## Settings

- `tsSwitch.autoRecovery`: automatically run the integrated recovery flow after config changes, diagnostic error spikes, or an unresponsive TS server.
- `tsSwitch.reloadWindowAfterRestart`: also reload the VS Code window after the restart and project reload flow.

## Command

- `TS Switch: Restart TypeScript Server`
- `TS Switch: Show Menu`

## Status Bar

- `TS Ready`: ready
- `TS Ready [Recovery]`: auto recovery is enabled
- `TS Restarting`: manual restart is running
- `TS Recovery`: auto recovery is running
- `TS Restarted`: restart completed
- `TS Error`: restart failed

## Notes

TS Switch does not run `npm`, `pnpm`, `yarn`, or development server scripts. It only uses VS Code's built-in TypeScript commands.

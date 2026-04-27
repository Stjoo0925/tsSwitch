# TS Switch

TS Switch is a small VS Code extension that restarts the built-in TypeScript server from the status bar.

Use it when IntelliSense, type checking, imports, or TS/JS language features get stuck and you would normally run `TypeScript: Restart TS Server` from the command palette.

## Usage

1. Open a TypeScript, TSX, JavaScript, or JSX workspace.
2. Click `TS: Restart` in the VS Code status bar.
3. TS Switch calls VS Code's built-in `typescript.restartTsServer` command.

## Command

- `TS Switch: Restart TypeScript Server`

## Logs

Open `Output` and select `TS Switch` to see restart events.

TS Switch writes:

- `Restart requested`
- active file, active language, workspace folders, `typescript.tsdk`, and `typescript.tsserver.log`
- `Restart completed`
- `Restart failed: <message>`

For VS Code's internal tsserver initialization details, run `TS Switch: Open TypeScript Server Log`.
Set `typescript.tsserver.log` to `verbose` if the tsserver log is disabled.

## Status Bar

- `TS: Restart`: ready to restart the TypeScript server.
- `TS: Restarting`: restart command is running.
- `TS: Restarted`: restart command completed.
- `TS: Error`: VS Code rejected the restart command.

## Notes

This extension does not run `npm`, `pnpm`, `yarn`, or any development server script. It only restarts the TypeScript language server used by VS Code.

import { TypeScriptRestartStatus } from './types';

const statusLabels: Record<TypeScriptRestartStatus, string> = {
  ready: '$(debug-restart) TS: Restart',
  restarting: '$(sync~spin) TS: Restarting',
  restarted: '$(check) TS: Restarted',
  error: '$(error) TS: Error'
};

export function getStatusLabel(status: TypeScriptRestartStatus): string {
  return statusLabels[status];
}

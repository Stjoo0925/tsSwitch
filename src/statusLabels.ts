import { TypeScriptRestartStatus } from './types';

export interface StatusLabelOptions {
  autoRecovery?: boolean;
}

const statusLabels: Record<TypeScriptRestartStatus, string> = {
  ready: '$(check) TS Ready',
  restarting: '$(sync~spin) TS Restarting',
  restarted: '$(check) TS Restarted',
  error: '$(warning) TS Error',
  auto: '$(tools) TS Recovery'
};

export function getStatusLabel(status: TypeScriptRestartStatus, options: StatusLabelOptions = {}): string {
  const label = statusLabels[status];
  if (status !== 'ready') {
    return label;
  }

  const indicators = [
    options.autoRecovery ? 'Recovery' : undefined,
  ].filter(Boolean);

  return indicators.length > 0 ? `${label} [${indicators.join(' ')}]` : label;
}

export interface TostConfig {
  progressBar: boolean;
  alerts: {
    bell: boolean;
    notify: boolean;
  };
  tickMs: number;
}

export const DEFAULT_CONFIG: TostConfig = {
  progressBar: true,
  alerts: {
    bell: true,
    notify: true,
  },
  tickMs: 250,
};

export const DEFAULT_CONFIG_NON_TTY: TostConfig = {
  progressBar: false,
  alerts: {
    bell: true,
    notify: true,
  },
  tickMs: 250,
};

export function validateConfig(data: unknown): TostConfig {
  if (data === null || typeof data !== 'object') {
    return DEFAULT_CONFIG;
  }
  const obj = data as Record<string, unknown>;
  const progressBar =
    typeof obj.progressBar === 'boolean' ? obj.progressBar : DEFAULT_CONFIG.progressBar;
  const tickMs =
    typeof obj.tickMs === 'number' && obj.tickMs > 0 ? obj.tickMs : DEFAULT_CONFIG.tickMs;

  let bell = DEFAULT_CONFIG.alerts.bell;
  let notify = DEFAULT_CONFIG.alerts.notify;
  if (obj.alerts !== null && typeof obj.alerts === 'object') {
    const alerts = obj.alerts as Record<string, unknown>;
    if (typeof alerts.bell === 'boolean') bell = alerts.bell;
    if (typeof alerts.notify === 'boolean') notify = alerts.notify;
  }

  return {
    progressBar,
    alerts: { bell, notify },
    tickMs,
  };
}

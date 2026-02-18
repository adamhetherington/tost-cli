import { formatTime } from '../utils/time.js';
import { renderProgressBar } from '../ui/progressBar.js';
import { ringBell, sendDesktopNotification } from '../ui/alerts.js';
import type { TostConfig } from '../config/schema.js';

export interface RunOptions {
  config: TostConfig;
  quiet: boolean;
  noBar: boolean;
  noBell: boolean;
  noNotify: boolean;
  notify: boolean;
}

export function runFocus(
  minutes: number,
  options: RunOptions
): Promise<{ completed: boolean; elapsedMs: number }> {
  return runSession(minutes, 'Focus', options);
}

export async function runBreak(
  minutes: number,
  options: RunOptions
): Promise<{ completed: boolean; elapsedMs: number }> {
  return runSession(minutes, 'Break', options);
}

async function runSession(
  minutes: number,
  label: string,
  options: RunOptions
): Promise<{ completed: boolean; elapsedMs: number }> {
  const totalMs = minutes * 60 * 1000;
  const start = Date.now();
  const isTty = process.stdout.isTTY ?? false;
  const tickMs = options.config.tickMs;

  const showBar =
    isTty &&
    options.config.progressBar &&
    !options.noBar &&
    !options.quiet;

  const showBell = !options.quiet && !options.noBell && options.config.alerts.bell;
  const showNotify =
    !options.quiet &&
    (options.notify || options.config.alerts.notify) &&
    !options.noNotify;

  return new Promise((resolve) => {
    const tick = async () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, totalMs - elapsed);
      const percent = Math.min(100, (elapsed / totalMs) * 100);

      if (remaining <= 0) {
        if (showBar) process.stdout.write('\r' + '\x1b[0K' + '\n');
        if (!options.quiet) {
          console.log(`✓ ${label} complete — ${formatTime(totalMs)}`);
        }
        if (showBell) ringBell();
        if (showNotify) {
          await sendDesktopNotification(`${label} complete`, formatTime(totalMs));
        }
        resolve({ completed: true, elapsedMs: totalMs });
        return;
      }

      if (showBar) {
        const line = renderProgressBar(label, remaining, totalMs, percent);
        process.stdout.write('\r' + line + '\x1b[0K');
      }

      setTimeout(tick, tickMs);
    };

    if (showBar) {
      const line = renderProgressBar(label, totalMs, totalMs, 0);
      process.stdout.write('\r' + line + '\x1b[0K');
    }

    let stopped = false;
    const onSigInt = () => {
      if (stopped) return;
      stopped = true;
      process.removeListener('SIGINT', onSigInt);
      const elapsed = Date.now() - start;
      if (showBar) process.stdout.write('\r' + '\x1b[0K' + '\n');
      console.log(`Stopped — ${formatTime(elapsed)} elapsed`);
      resolve({ completed: false, elapsedMs: elapsed });
    };
    process.on('SIGINT', onSigInt);

    setTimeout(tick, tickMs);
  });
}

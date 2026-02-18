import { formatTime } from '../utils/time.js';

/**
 * Bar width: clamp(stdout.columns - 40, 10, 40)
 */
function getBarWidth(): number {
  const cols = process.stdout.columns ?? 80;
  const w = cols - 40;
  return Math.max(10, Math.min(40, w));
}

const CYAN = '\x1b[36m';
const DIM = '\x1b[90m';
const RESET = '\x1b[0m';

function buildBar(percent: number, width: number): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const block = '█';
  const space = '░';
  return `[${CYAN}${block.repeat(filled)}${DIM}${space.repeat(empty)}${RESET}]`;
}

export function renderProgressBar(
  label: string,
  remainingMs: number,
  totalMs: number,
  percent: number
): string {
  const timeStr = formatTime(remainingMs);
  const barWidth = getBarWidth();
  const bar = buildBar(percent, barWidth);
  return `${label} — ${timeStr} remaining  ${bar} ${Math.round(percent)}%`;
}

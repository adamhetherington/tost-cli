import { homedir, platform } from 'os';
import { join } from 'path';

export function getConfigDir(): string {
  const p = platform();
  if (p === 'win32') {
    const appData = process.env.APPDATA;
    if (!appData) {
      return join(homedir(), 'AppData', 'Roaming', 'tost');
    }
    return join(appData, 'tost');
  }
  if (p === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'tost');
  }
  return join(homedir(), '.config', 'tost');
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

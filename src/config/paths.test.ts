import { describe, it, expect } from 'vitest';
import { homedir, platform } from 'os';
import { join } from 'path';
import { getConfigDir, getConfigPath } from './paths.js';

describe('getConfigDir', () => {
  it('returns platform-specific path', () => {
    const dir = getConfigDir();
    const p = platform();
    if (p === 'win32') {
      const appData = process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming');
      expect(dir).toBe(join(appData, 'tost'));
    } else if (p === 'darwin') {
      expect(dir).toBe(join(homedir(), 'Library', 'Application Support', 'tost'));
    } else {
      expect(dir).toBe(join(homedir(), '.config', 'tost'));
    }
  });
});

describe('getConfigPath', () => {
  it('returns config.json inside config dir', () => {
    const path = getConfigPath();
    expect(path).toMatch(/config\.json$/);
    expect(path).toContain('tost');
  });
});

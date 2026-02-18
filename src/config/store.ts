import { mkdir, readFile, writeFile, rename, access } from 'fs/promises';
import { getConfigDir, getConfigPath } from './paths.js';
import {
  type TostConfig,
  validateConfig,
  DEFAULT_CONFIG,
  DEFAULT_CONFIG_NON_TTY,
} from './schema.js';

export async function configExists(): Promise<boolean> {
  try {
    await access(getConfigPath());
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(isTty: boolean): Promise<{ config: TostConfig; valid: boolean }> {
  const path = getConfigPath();
  try {
    const content = await readFile(path, 'utf-8');
    const data = JSON.parse(content) as unknown;
    return { config: validateConfig(data), valid: true };
  } catch {
    return {
      config: isTty ? DEFAULT_CONFIG : DEFAULT_CONFIG_NON_TTY,
      valid: false,
    };
  }
}

export async function saveConfig(config: TostConfig): Promise<void> {
  const dir = getConfigDir();
  await mkdir(dir, { recursive: true });
  const path = getConfigPath();
  await writeFile(path, JSON.stringify(config, null, 2), 'utf-8');
}

export async function backupAndRemoveConfig(): Promise<void> {
  const path = getConfigPath();
  try {
    await rename(path, path + '.bak');
  } catch {
    // Config may not exist
  }
}

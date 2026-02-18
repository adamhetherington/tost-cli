import { getConfigPath } from '../config/paths.js';
import { loadConfig, configExists, backupAndRemoveConfig } from '../config/store.js';

export async function printConfig(): Promise<void> {
  const path = getConfigPath();
  const exists = await configExists();
  const isTty = process.stdout.isTTY ?? false;
  const { config } = await loadConfig(isTty);
  console.log('Config path:', path);
  console.log('Current config:');
  console.log(JSON.stringify(config, null, 2));
}

export async function setConfigKey(keyPath: string, valueStr: string): Promise<void> {
  const isTty = process.stdout.isTTY ?? false;
  const { config } = await loadConfig(isTty);
  const keys = keyPath.split('.');
  if (keys.length === 0) {
    console.error('tost: Invalid key');
    process.exit(1);
  }
  let target: Record<string, unknown> = config as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in target) || typeof target[k] !== 'object' || target[k] === null) {
      target[k] = {};
    }
    target = target[k] as Record<string, unknown>;
  }
  const lastKey = keys[keys.length - 1]!;
  let value: unknown = valueStr;
  if (valueStr === 'true') value = true;
  else if (valueStr === 'false') value = false;
  else if (/^\d+$/.test(valueStr)) value = parseInt(valueStr, 10);
  target[lastKey] = value;

  const { saveConfig } = await import('../config/store.js');
  await saveConfig(config);
  console.log(`tost: Set ${keyPath} = ${JSON.stringify(value)}`);
}

export async function resetConfig(): Promise<void> {
  await backupAndRemoveConfig();
  console.log('tost: Config reset. Wizard will run on next start.');
}

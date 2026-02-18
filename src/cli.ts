#!/usr/bin/env node
import { program } from 'commander';
import { configExists, loadConfig } from './config/store.js';
import { runWizard } from './config/wizard.js';
import { runFocus, runBreak } from './commands/focus.js';
import * as configCmd from './commands/config.js';

const isTty = process.stdout.isTTY ?? false;

interface GlobalFlags {
  quiet: boolean;
  noBar: boolean;
  noBell: boolean;
  noNotify: boolean;
  notify: boolean;
}

async function ensureConfig(): Promise<{ config: Awaited<ReturnType<typeof loadConfig>>['config'] }> {
  const exists = await configExists();
  if (!exists && isTty) {
    const config = await runWizard();
    return { config };
  }
  const { config, valid } = await loadConfig(isTty);
  if (!valid && exists && isTty) {
    const { backupAndRemoveConfig } = await import('./config/store.js');
    await backupAndRemoveConfig();
    const wizardConfig = await runWizard();
    return { config: wizardConfig };
  }
  if (!valid && exists && !isTty) {
    const { backupAndRemoveConfig } = await import('./config/store.js');
    await backupAndRemoveConfig();
  }
  return { config };
}

function parseMinutes(arg: string): number {
  const n = parseFloat(arg);
  if (!Number.isFinite(n) || n <= 0) {
    console.error('tost: Minutes must be a positive number.');
    process.exit(1);
  }
  return n;
}

program
  .name('tost')
  .description('Task Oriented Session Timer — a minimal focus timer')
  .version('0.1.0')
  .option('--quiet', 'Minimal output, disables progress bar and all alerts')
  .option('--no-bar', 'Disable progress bar for this run')
  .option('--no-bell', 'Disable terminal bell for this run')
  .option('--no-notify', 'Disable desktop notification for this run')
  .option('--notify', 'Explicitly enable desktop notification for this run');

program
  .argument('[minutes]', 'Focus session length in minutes')
  .action(async (minutesArg: string | undefined) => {
    const opts = program.opts<GlobalFlags>();
    if (minutesArg === undefined || minutesArg === '') {
      program.outputHelp();
      process.exit(0);
    }
    const minutes = parseMinutes(minutesArg);
    const { config } = await ensureConfig();
    await runFocus(minutes, {
      config,
      quiet: opts.quiet ?? false,
      noBar: opts.noBar ?? false,
      noBell: opts.noBell ?? false,
      noNotify: opts.noNotify ?? false,
      notify: opts.notify ?? false,
    });
  });

program
  .command('break <minutes>')
  .description('Start a break session')
  .action(async (minutesArg: string) => {
    const opts = program.opts<GlobalFlags>();
    const minutes = parseMinutes(minutesArg);
    const { config } = await ensureConfig();
    await runBreak(minutes, {
      config,
      quiet: opts.quiet ?? false,
      noBar: opts.noBar ?? false,
      noBell: opts.noBell ?? false,
      noNotify: opts.noNotify ?? false,
      notify: opts.notify ?? false,
    });
  });

const configCommand = program
  .command('config')
  .description('Print config path and current config JSON');

configCommand
  .command('set <key> <value>')
  .description('Update config (supports nested keys like alerts.bell)')
  .action(async (key: string, value: string) => {
    await configCmd.setConfigKey(key, value);
  });

configCommand
  .command('reset')
  .description('Delete config so wizard runs next time')
  .action(async () => {
    await configCmd.resetConfig();
  });

configCommand.action(async () => {
  await configCmd.printConfig();
});

program.parse();

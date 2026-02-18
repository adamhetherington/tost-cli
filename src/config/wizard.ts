import * as readline from 'readline';
import { createInterface } from 'readline';
import { saveConfig } from './store.js';
import type { TostConfig } from './schema.js';

async function prompt(question: string, defaultValue: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (default: ${defaultValue}): `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

export async function runWizard(): Promise<TostConfig> {
  console.log('Welcome to tost — Task Oriented Session Timer.\n');

  const progressBarAnswer = await prompt('1. Enable single-line progress bar?', 'Yes');
  const progressBar =
    /^(y|yes|1|true)$/i.test(progressBarAnswer) || progressBarAnswer === '';

  console.log('\n2. Completion alerts:');
  console.log('   (1) Bell + Desktop Notification (default)');
  console.log('   (2) Bell only');
  console.log('   (3) Desktop notification only');
  console.log('   (0) None\n');

  const alertsAnswer = await prompt('Choice', '1');
  let bell = true;
  let notify = true;
  switch (alertsAnswer) {
    case '0':
      bell = false;
      notify = false;
      break;
    case '2':
      bell = true;
      notify = false;
      break;
    case '3':
      bell = false;
      notify = true;
      break;
    default:
      bell = true;
      notify = true;
  }

  const config: TostConfig = {
    progressBar,
    alerts: { bell, notify },
    tickMs: 250,
  };

  await saveConfig(config);
  return config;
}

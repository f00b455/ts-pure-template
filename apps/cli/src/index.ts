#!/usr/bin/env node
import cac from 'cac';
import { createSpinner } from 'nanospinner';
import cliProgress from 'cli-progress';
import gradient from 'gradient-string';
import boxen from 'boxen';
import pc from 'picocolors';
import { fooGreet, type FooConfig } from '@ts-template/lib-foo';

const cli = cac('hello-cli');

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const runSpinner = async (): Promise<void> => {
  const spinner = createSpinner('Preparing something awesome...').start();
  await delay(5000);
  spinner.success({ text: 'Ready!' });
};

const runProgressBar = async (): Promise<void> => {
  const progressBar = new cliProgress.SingleBar({
    format: pc.cyan('Progress |') + pc.green('{bar}') + pc.cyan('| {percentage}% | {value}/{total}'),
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(100, 0);

  for (let i = 0; i <= 100; i++) {
    progressBar.update(i);
    await delay(30); // 3 seconds total (30ms * 100)
  }

  progressBar.stop();
};

const displayGreeting = (name: string): void => {
  const config: FooConfig = {
    prefix: '✨',
    suffix: '✨'
  };

  const greetingMessage = fooGreet(config)(name);

  // Create gradient text
  const gradientText = gradient.rainbow(greetingMessage);

  // Create boxed output
  const boxedMessage = boxen(gradientText, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
    title: 'Hello CLI',
    titleAlignment: 'center'
  });

  console.log(boxedMessage);
};

cli
  .command('', 'Generate a colorful hello message')
  .option('--name <name>', 'Name to greet', { default: 'World' })
  .action(async (options) => {
    try {
      console.log(pc.magenta('\n🎉 Welcome to Hello CLI!\n'));

      // Run spinner
      await runSpinner();

      // Run progress bar
      await runProgressBar();

      // Display greeting
      console.log('\n');
      displayGreeting(options.name);

      console.log(pc.green('\n✅ All done! Have a great day!\n'));
    } catch (error) {
      console.error(pc.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      process.exit(1);
    }
  });

cli.help();
cli.version('1.0.0');

// Handle parse errors to show help
try {
  cli.parse();
} catch (error) {
  // Show help message when there's an error
  cli.outputHelp();
  process.exit(1);
}
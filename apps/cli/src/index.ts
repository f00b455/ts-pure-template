#!/usr/bin/env node
import { cac } from 'cac';
import { createSpinner } from 'nanospinner';
import cliProgress from 'cli-progress';
import gradient from 'gradient-string';
import boxen from 'boxen';
import pc from 'picocolors';
import { createFooProcessor } from '@ts-template/lib-foo';

const cli = cac('hello-cli');

cli
  .option('--name <name>', 'Name to greet', {
    default: 'World'
  })
  .help();

cli.command('', 'Greet with style')
  .action(async (options) => {
    const name = options.name || 'World';

    // Start spinner for 5 seconds
    const spinner = createSpinner('Preparing greeting...').start();

    await new Promise(resolve => setTimeout(resolve, 5000));
    spinner.success({ text: pc.green('Ready!') });

    // Progress bar for 3 seconds
    const progressBar = new cliProgress.SingleBar({
      format: pc.cyan('Progress |') + '{bar}' + pc.cyan('| {percentage}% | {value}/{total}'),
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    progressBar.start(100, 0);

    // Update progress bar over 3 seconds
    const updateInterval = 30; // Update every 30ms
    const totalUpdates = 3000 / updateInterval;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += 100 / totalUpdates;
      progressBar.update(Math.min(currentProgress, 100));

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        progressBar.stop();
      }
    }, updateInterval);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create the greeting using fooGreet from lib-foo
    const fooProcessor = createFooProcessor({
      prefix: '✨ ',
      suffix: ' ✨'
    });

    const greeting = fooProcessor.greetWithFoo(name);

    // Create colorful gradient greeting
    const gradientGreeting = gradient.rainbow(greeting);

    // Display in a beautiful box
    const boxedGreeting = boxen(gradientGreeting, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      title: '🎉 Hello CLI 🎉',
      titleAlignment: 'center'
    });

    console.log(boxedGreeting);
  });

// Parse CLI arguments
try {
  cli.parse();
} catch (error) {
  console.error(pc.red('Error:'), error instanceof Error ? error.message : String(error));
  process.exit(1);
}
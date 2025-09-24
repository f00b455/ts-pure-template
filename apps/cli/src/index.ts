import { cac } from 'cac';
import pc from 'picocolors';
import { createSpinner } from 'nanospinner';
import cliProgress from 'cli-progress';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { fooGreet } from '@ts-template/lib-foo';

const cli = cac('hello-cli');

cli
  .option('--name <name>', 'Name to greet', {
    default: 'World'
  })
  .help();

cli.command('', 'Generate a colorful greeting')
  .action(async (options) => {
    try {
      const spinner = createSpinner('Preparing greeting...').start();

      await new Promise(resolve => setTimeout(resolve, 5000));

      spinner.success({ text: pc.green('Ready!') });

      const progressBar = new cliProgress.SingleBar({
        format: pc.cyan('Progress |') + '{bar}' + pc.cyan('| {percentage}%'),
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      progressBar.start(100, 0);

      for (let i = 0; i <= 100; i++) {
        progressBar.update(i);
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      progressBar.stop();

      const greeting = fooGreet(options.name);
      const colorfulGreeting = gradient.rainbow(greeting);

      const boxedGreeting = boxen(colorfulGreeting, {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        title: '✨ Hello CLI ✨',
        titleAlignment: 'center'
      });

      console.log(boxedGreeting);

      process.exit(0);
    } catch (error) {
      console.error(pc.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli.parse();
import { parse } from 'yargs';
import * as ora from 'ora';
import { spawn, SpawnOptions } from 'child_process';

const spinner = ora({ spinner: 'dots' });

async function asyncSpawn(command: string, options?: SpawnOptions): Promise<void> {
  const newOptions = { ...options, shell: true };
  return new Promise((resolvep, reject) => {
    try {
      const spawnCmd = spawn(command, newOptions);
      spawnCmd.stdout?.on('data', data => console.log(`\n${data}`));
      spawnCmd.stderr?.on('data', data => console.error(`\n${data}`));
      spawnCmd.on('close', () => {
        resolvep();
      });
    } catch (err) {
      reject(err);
    }
  });
}

const rawArgs = parse(process.argv.slice(2));
const successSymbol = '✔';
const errorSymbol = '⚠';

function getArg<T>(argNames: string | string[]): T | undefined {
  const argsNamesArray = Array.isArray(argNames) ? argNames : [argNames];
  for (const argName of argsNamesArray) {
    if (argName in rawArgs) {
      return (rawArgs as any)[argName] as T;
    }
  }
  return undefined;
}

const args = {
  all: getArg<boolean>(['all', 'a']),
  control: getArg<boolean>(['control', 'c']),
  router: getArg<boolean>(['router', 'r']),
  store: getArg<boolean>(['store', 's']),
  utils: getArg<boolean>(['utils', 'u']),
};

async function publish(packageName: string): Promise<void> {
  spinner.start(`publishing ${packageName}`);
  try {
    await asyncSpawn(`cd dist/stlmpp/${packageName} && npm publish`);
    spinner.stopAndPersist({ symbol: successSymbol, text: `${packageName} published` });
  } catch (err) {
    spinner.stopAndPersist({ symbol: errorSymbol, text: `Publishing ${packageName} failed` });
    console.error(err);
  }
}

async function main(): Promise<void> {
  const { all, control, router, store, utils } = args;
  if (control || all) {
    await publish('control');
  }
  if (router || all) {
    await publish('router');
  }
  if (store || all) {
    await publish('store');
  }
  if (utils || all) {
    await publish('utils');
  }
}

main().then();

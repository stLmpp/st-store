import * as ora from 'ora';
import { spawn, SpawnOptions } from 'child_process';
import { parse } from 'yargs';

export function getSpinner(): ora.Ora {
  return ora({ spinner: 'dots' });
}

export async function asyncSpawn(command: string, args?: string[], options?: SpawnOptions): Promise<void> {
  const newOptions = { ...options, shell: true };
  return new Promise((resolvep, reject) => {
    try {
      const spawnCmd = args?.length ? spawn(command, args, newOptions) : spawn(command, newOptions);
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

export function getArg<T>(argNames: string | string[]): T | undefined {
  const argsNamesArray = Array.isArray(argNames) ? argNames : [argNames];
  for (const argName of argsNamesArray) {
    if (argName in rawArgs) {
      return (rawArgs as any)[argName] as T;
    }
  }
  return undefined;
}

export const successSymbol = '✔';
export const errorSymbol = '⚠';

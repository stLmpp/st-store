import { asyncSpawn, errorSymbol, getArg, getSpinner, successSymbol } from './util';

const spinner = getSpinner();

const args = {
  all: getArg<boolean>(['all', 'a']) ?? true,
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

// TODO figure out the login

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

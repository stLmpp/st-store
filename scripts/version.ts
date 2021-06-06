import { asyncSpawn } from './util';

const args = process.argv.slice(2);

async function main(): Promise<void> {
  const promises: Promise<void>[] = [
    asyncSpawn(`cd projects/stlmpp/control && npm version`, args),
    asyncSpawn(`cd projects/stlmpp/router && npm version`, args),
    asyncSpawn(`cd projects/stlmpp/store && npm version`, args),
    asyncSpawn(`cd projects/stlmpp/utils && npm version`, args),
  ];
  await Promise.all(promises);
}

main().then();

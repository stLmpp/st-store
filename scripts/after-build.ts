import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const projects = ['control', 'router', 'store', 'utils'];

async function main(): Promise<void> {
  for (const project of projects) {
    const packageJsonPath = resolve(process.cwd() + `/dist/stlmpp/${project}/package.json`);
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    packageJson.es2015 = packageJson.es2015.replace('fesm2015', 'esm2015');
    writeFileSync(packageJsonPath, JSON.stringify(packageJson));
  }
}

main().then().catch(console.error);

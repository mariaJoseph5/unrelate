import { promises as fs } from 'fs';
import { parse, stringify } from 'comment-json';
export async function configure(action: string, value: string): Promise<void> {
  try {
    if (!action || !value) {
      throw new Error("Error: configure requires two parameters");
    }
    switch (action) {
      case 'baseUrl': {
        await configureBaseUrl(value);
        break;
      }
    }
  }
  catch (err) {
    logError(err.message)
  }
}

async function configureBaseUrl(baseUrl: string): Promise<void> {
  const manager = dataManager();
  let data = (await manager.next()).value;
  data.compilerOptions.baseUrl = baseUrl;
  await manager.next(data);
  return;
}

async function* dataManager() {
  let dataStr = await getConfigFile();
  const data = yield parse(dataStr);
  await setConfigFile(stringify(data, null, 2));
  return;
}


function logError(message: string): void {
  if (message.includes('ENOENT')) {
    console.error('ERROR: Cannot find tsconfig.json in the current directory.');
    console.log(`You can run 'tsc --init' to create one.`);
  }
  else {
    console.error(message);
  }
}

async function setConfigFile(data: string): Promise<void> {
  const configFile = getFilePath();
  await fs.writeFile(configFile, data, 'utf-8');
  return;
}

async function getConfigFile(): Promise<string> {
  const configFile = getFilePath();
  const data: string = await fs.readFile(configFile, 'utf-8');
  return data;
}

function getFilePath(): string {
  const directory = process.cwd();
  const configFile: string = `${directory}/tsconfig.json`;
  return configFile;
}
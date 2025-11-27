import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'default';
// Navigate from dist/src to root config folder when compiled, or from src to config when running directly
const configPath = join(__dirname, '..', '..', 'config', `${env}.yaml`);

let configData: any;
try {
  const fileContents = readFileSync(configPath, 'utf8');
  configData = yaml.load(fileContents);
} catch (e) {
  // Fallback to default
  const defaultPath = join(__dirname, '..', '..', 'config', 'default.yaml');
  const fileContents = readFileSync(defaultPath, 'utf8');
  configData = yaml.load(fileContents);
}

export function get<T = any>(path: string): T {
  const keys = path.split('.');
  let value = configData;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Configuration key not found: ${path}`);
    }
  }

  return value as T;
}

export default { get };

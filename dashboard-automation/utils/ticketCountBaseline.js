import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = path.join(__dirname, '..', 'data', 'baselines');

function baselineFilePath(key) {
  return path.join(BASELINE_DIR, `${key}.json`);
}

/**
 * Reads the last recorded value for `key`, or null if no baseline has been
 * recorded yet (e.g. first-ever run).
 */
export function readBaseline(key) {
  const file = baselineFilePath(key);
  if (!fs.existsSync(file)) return null;
  const { value } = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return value;
}

/**
 * Records `value` as the new baseline for `key`. Committing this file is
 * what makes the baseline survive across CI runs on a fresh checkout - if
 * it's left untracked/gitignored, every CI job starts with no baseline.
 */
export function writeBaseline(key, value) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.writeFileSync(
    baselineFilePath(key),
    JSON.stringify({ value, recordedAt: new Date().toISOString() }, null, 2) + '\n',
  );
}

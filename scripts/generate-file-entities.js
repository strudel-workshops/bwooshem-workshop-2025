import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(
  __dirname,
  '../public/dummy-data/file-entities.json'
);

// Read all CSV files from the data directory
const files = fs
  .readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.csv'))
  .map((file) => ({
    name: file.replace('.csv', ''),
    average: '',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Write the file entities JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));

console.log(`Generated file-entities.json with ${files.length} CSV files`);
files.forEach((file) => console.log(`  - ${file.name}.csv`));

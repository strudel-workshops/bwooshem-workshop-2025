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

function generateFileEntities() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.csv'))
    .map((file) => ({
      name: file.replace('.csv', ''),
      average: '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));
  console.log(
    `[${new Date().toLocaleTimeString()}] Generated file-entities.json with ${files.length} CSV files`
  );
  return files;
}

// Generate initial file list
generateFileEntities();

// Watch for changes in the data directory
console.log(`Watching ${DATA_DIR} for CSV file changes...`);
fs.watch(DATA_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.csv')) {
    console.log(`Detected change: ${eventType} - ${filename}`);
    generateFileEntities();
  }
});

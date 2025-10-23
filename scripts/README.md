# CSV File Auto-Detection Scripts

## Overview

These scripts automatically detect CSV files in the `public/data` directory and generate the `file-entities.json` file used by the explore-data task flow.

## Scripts

### `generate-file-entities.js`

One-time generation of the `file-entities.json` file from CSV files in `public/data`.

**Usage:**

```bash
npm run generate:files
```

**When it runs:**

- Automatically before building (`npm run build`)
- Manually when you need to regenerate the file list

### `watch-csv-files.js`

Watches the `public/data` directory for changes and automatically regenerates `file-entities.json` when CSV files are added or removed.

**Usage:**

```bash
npm run watch:files
```

**When it runs:**

- Automatically when you start the development server (`npm run dev`)
- The watcher runs continuously alongside Vite

## How It Works

1. **Development Mode (`npm run dev`):**

   - Starts the file watcher
   - Starts the Vite dev server
   - Both run concurrently
   - When you add/remove CSV files in `public/data`, the watcher automatically updates `file-entities.json`
   - The browser will hot-reload to reflect the changes

2. **Build Mode (`npm run build`):**
   - Runs `generate-file-entities.js` once before building
   - Ensures the production build has the latest file list

## Adding/Removing CSV Files

Simply add or remove CSV files in the `public/data` directory:

1. **During Development:**

   - With `npm run dev` running, add/remove CSV files
   - The watcher detects the change automatically
   - `file-entities.json` is regenerated
   - The UI updates to show the new file list

2. **Before Building:**
   - The `prebuild` script ensures the file list is up to date

## File Format

All CSV files in `public/data` are assumed to have the same format and be cleaned data. The system generates entries like:

```json
[
  {
    "name": "filename1",
    "average": ""
  },
  {
    "name": "filename2",
    "average": ""
  }
]
```

The `average` field is calculated dynamically by the application when the data is loaded.

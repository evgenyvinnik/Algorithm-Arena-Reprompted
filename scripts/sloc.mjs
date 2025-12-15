#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const includedExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.less',
  '.html',
  '.json',
  '.md',
]);

const ignoredDirectories = new Set([
  '.cache',
  '.git',
  '.husky',
  '.idea',
  '.next',
  '.pnpm-store',
  '.svelte-kit',
  '.tamagui',
  '.turbo',
  '.vercel',
  '.vitepress',
  '.vscode',
  '.yarn',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'storybook-static',
  'temp',
  'tmp',
  'Original',
]);

const ignoredFiles = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isBinary(buffer) {
  return buffer.includes(0);
}

function countFileLines(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (isBinary(buffer)) return 0;
    const text = buffer.toString('utf8');
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .length;
  } catch (err) {
    return 0;
  }
}

function walk(directory) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (err) {
    return { total: 0, perExtension: new Map() };
  }

  let total = 0;
  const perExtension = new Map();

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      const { total: dirTotal, perExtension: dirExt } = walk(fullPath);
      total += dirTotal;
      for (const [ext, count] of dirExt.entries()) {
        perExtension.set(ext, (perExtension.get(ext) ?? 0) + count);
      }
    } else {
      if (ignoredFiles.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!includedExtensions.has(ext)) continue;
      const count = countFileLines(fullPath);
      total += count;
      perExtension.set(ext, (perExtension.get(ext) ?? 0) + count);
    }
  }

  return { total, perExtension };
}

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

function main() {
  const rootArg = process.argv[2];
  const root = rootArg ? path.resolve(rootArg) : path.resolve(__dirname, '..');
  const { total, perExtension } = walk(root);

  console.log(`SLOC for: ${root}`);
  console.log('--------------------------------');
  const sorted = [...perExtension.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    console.log('No files found with configured extensions.');
  } else {
    console.log('SLOC by extension (non-empty lines):');
    for (const [ext, count] of sorted) {
      console.log(`${ext.padEnd(6)} : ${formatNumber(count)}`);
    }
    console.log('--------------------------------');
    console.log('Total SLOC:', formatNumber(total));
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('sloc.mjs')) {
  main();
}

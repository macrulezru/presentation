#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// --- Аргументы ---
const args = process.argv.slice(2);
let fromVar = null;
let toVar = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-from' && args[i + 1]) {
    fromVar = args[i + 1];
    i++;
  } else if (args[i] === '-to' && args[i + 1]) {
    toVar = args[i + 1];
    i++;
  } else if (!fromVar) {
    fromVar = args[i];
  } else if (!toVar) {
    toVar = args[i];
  }
}
if (!fromVar || !toVar) {
  console.error(
    'Usage: node utils/css-variables-rename.js -from --old-var -to --new-var',
  );
  process.exit(1);
}

const __dirname = path.dirname(
  new URL(import.meta.url).pathname.replace(/^\/[A-Za-z]:/, m => m.slice(1)),
);
const SRC_DIR = path.join(__dirname, '../src');
const VARIABLES_FILE = path.join(SRC_DIR, 'view/styles/variables.scss');

function walk(dir, excludeFile, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath === excludeFile) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, excludeFile, fileList);
    } else if (stat.isFile()) {
      if (fullPath.endsWith('.css') || fullPath.endsWith('.css.map')) continue;
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// --- Переименование во всех файлах ---
// --- Проверка на существование новой переменной ---
const allFiles = walk(SRC_DIR, VARIABLES_FILE);
const scssFiles = allFiles.filter(f => f.endsWith('.scss'));
const varDefRegex = new RegExp(`(^|[ \t]*)${toVar}\s*:\s*[^;]+;?([ \t]*|$)`, 'gm');
const foundDefs = [];
for (const file of scssFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (varDefRegex.test(content)) {
    foundDefs.push(file);
  }
}
if (foundDefs.length > 0) {
  console.error(`ОШИБКА: переменная ${toVar} уже определена в следующих файлах:`);
  foundDefs.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

const allFiles = walk(SRC_DIR, VARIABLES_FILE);
let replaceCount = 0;
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Переименовать использование: var(--old-var) => var(--new-var)
  let replaced = content.replace(
    new RegExp(`var\\(${fromVar.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'g'),
    `var(${toVar})`,
  );
  // Переименовать определение: --old-var: ... => --new-var: ...
  replaced = replaced.replace(new RegExp(`(${fromVar})(\s*:)`, 'g'), `${toVar}$2`);
  if (replaced !== content) {
    fs.writeFileSync(file, replaced, 'utf8');
    const matches =
      (
        content.match(
          new RegExp(`var\\(${fromVar.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'g'),
        ) || []
      ).length + (content.match(new RegExp(`(${fromVar})(\s*:)`, 'g')) || []).length;
    replaceCount += matches;
    console.log(`Переименовано в ${file}: ${matches}`);
  }
}

console.log(`Всего переименований: ${replaceCount}`);
console.log('Готово!');

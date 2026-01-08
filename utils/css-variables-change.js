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
    'Usage: node utils/css-variables-change.js -from --old-var -to --new-var',
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

// --- Замена во всех файлах ---
const allFiles = walk(SRC_DIR, VARIABLES_FILE);
let replaceCount = 0;
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const replaced = content.replace(
    new RegExp(`var\\(${fromVar.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'g'),
    `var(${toVar})`,
  );
  if (replaced !== content) {
    fs.writeFileSync(file, replaced, 'utf8');
    const matches = (
      content.match(
        new RegExp(`var\\(${fromVar.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'g'),
      ) || []
    ).length;
    replaceCount += matches;
    console.log(`Заменено в ${file}: ${matches}`);
  }
}

// --- Удаление определения переменной во всех scss-файлах ---

const scssFiles = allFiles.filter(f => f.endsWith('.scss'));
let defRemoveCount = 0;
// Регулярка: начало строки или пробелы, --var, :, значение, ;, пробелы/конец строки
const varDefRegex = new RegExp(`(^|[ \t]*)${fromVar}\s*:\s*[^;]+;?([ \t]*|$)`, 'gm');
for (const file of scssFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (varDefRegex.test(content)) {
    content = content.replace(varDefRegex, '');
    fs.writeFileSync(file, content, 'utf8');
    defRemoveCount++;
    console.log(`Удалено определение ${fromVar} из ${file}`);
  }
}
// Обработка variables.scss отдельно, если вдруг он не попал в allFiles
if (!scssFiles.includes(VARIABLES_FILE)) {
  let content = fs.readFileSync(VARIABLES_FILE, 'utf8');
  if (varDefRegex.test(content)) {
    content = content.replace(varDefRegex, '');
    fs.writeFileSync(VARIABLES_FILE, content, 'utf8');
    defRemoveCount++;
    console.log(`Удалено определение ${fromVar} из ${VARIABLES_FILE}`);
  }
}
if (defRemoveCount === 0) {
  console.log(`Определение ${fromVar} не найдено ни в одном .scss файле`);
}

console.log(`Всего замен: ${replaceCount}`);
console.log('Готово!');

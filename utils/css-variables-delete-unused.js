// Удаляет неиспользуемые SCSS-переменные по всему проекту, кроме файлов *.scss.map
// Отчёт выводится в консоль

import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(
  new URL(import.meta.url).pathname.replace(/^\/[A-Za-z]:/, m => m.slice(1)),
);
const SRC_DIR = path.join(__dirname, '../src');

// Регулярка для поиска CSS-переменных в :root или других селекторах
const cssVarRegex = /--([\w-]+)\s*:/g;
// Регулярка для поиска использования переменных в коде
// (не используется, можно удалить)

// Рекурсивно собирает все файлы, кроме *.css и *.css.map
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (!filePath.endsWith('.css') && !filePath.endsWith('.css.map')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Собирает все SCSS-переменные из файлов *.scss
function getScssVariablesFromScssFiles(dir) {
  const vars = new Set();
  const files = getAllFiles(dir).filter(f => f.endsWith('.scss'));
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = cssVarRegex.exec(content))) {
      vars.add(match[1]);
    }
  });
  return Array.from(vars);
}

// Проверяет использование переменных во всех файлах, кроме *.scss и *.scss.map
function findUsedVariables(dir, variables) {
  const used = new Set();
  const files = getAllFiles(dir);
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    variables.forEach(variable => {
      if (content.includes(`var(--${variable})`)) {
        used.add(variable);
      }
    });
  });
  return used;
}

// Удаляет неиспользуемые переменные из всех *.scss файлов
function deleteUnusedVariablesFromScss(dir, unusedVars) {
  const files = getAllFiles(dir).filter(f => f.endsWith('.scss'));
  const deleted = [];
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    unusedVars.forEach(variable => {
      // Удаляет строку с определением переменной
      const before = content;
      content = content.replace(new RegExp(`\s*--${variable}\s*:[^;]+;?\n?`, 'g'), '');
      if (before !== content) {
        deleted.push({ file, variable });
      }
    });
    fs.writeFileSync(file, content, 'utf8');
  });
  return deleted;
}

// Главная функция
function main() {
  const allVars = getScssVariablesFromScssFiles(SRC_DIR);
  const usedVars = findUsedVariables(SRC_DIR, allVars);
  const unusedVars = allVars.filter(v => !usedVars.has(v));

  if (unusedVars.length === 0) {
    console.log('Неиспользуемых SCSS-переменных не найдено.');
    return;
  }

  const deleted = deleteUnusedVariablesFromScss(SRC_DIR, unusedVars);

  if (deleted.length === 0) {
    console.log(
      'Неиспользуемые переменные найдены, но не были удалены (возможно, формат отличается).',
    );
  } else {
    console.log('Удалены следующие SCSS-переменные:');
    deleted.forEach(({ file, variable }) => {
      console.log(`  --${variable} из файла ${file}`);
    });
  }
}

main();

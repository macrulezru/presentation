import fs from 'fs';
import path from 'path';

// ...existing code...

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
      // Пропускаем .css и .css.map
      if (fullPath.endsWith('.css') || fullPath.endsWith('.css.map')) continue;
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function extractCssVars(content) {
  const regex = /var\(--([\w-]+)\)/g;
  const vars = new Set();
  let match;
  while ((match = regex.exec(content))) {
    vars.add(`--${match[1]}`);
  }
  return vars;
}

function extractVarsFromScss(content) {
  // Ищем --var: value; (значение до ;)
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  const vars = new Set();
  const varMap = new Map();
  let match;
  while ((match = regex.exec(content))) {
    vars.add(match[1]);
    varMap.set(match[1], match[2].trim());
  }
  return { vars, varMap };
}

// 1. Собираем все CSS переменные из src (кроме variables.scss)
const allFiles = walk(SRC_DIR, VARIABLES_FILE);
const usedVars = new Set();
const varUsageIndex = {};
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const v of extractCssVars(content)) {
    usedVars.add(v);
  }
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const regex = /var\(--([\w-]+)\)/g;
    let match;
    while ((match = regex.exec(line))) {
      const varName = `--${match[1]}`;
      if (!varUsageIndex[varName]) varUsageIndex[varName] = [];
      varUsageIndex[varName].push({ file, line: idx + 1 });
    }
  });
}

// 2. Собираем все переменные из variables.scss
const variablesScss = fs.readFileSync(VARIABLES_FILE, 'utf8');
const { vars: definedVars, varMap: definedVarMap } = extractVarsFromScss(variablesScss);

// Цвета для вывода
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const WHITE = '\x1b[37m';
const ORANGE = '\x1b[38;5;208m'; // 256-color orange
const BOLD = '\x1b[1m';

function section(title, color) {
  console.log(`${color + BOLD}====================${RESET}`);
  console.log(color + BOLD + title + RESET);
  console.log(`${color + BOLD}====================${RESET}`);
}

const usedVarsArr = Array.from(usedVars).sort();
const definedVarsArr = Array.from(definedVars).sort();
// Поиск дубликатов значений
const valueGroups = {};
for (const [key, value] of definedVarMap.entries()) {
  if (!valueGroups[value]) valueGroups[value] = [];
  valueGroups[value].push(key);
}
const duplicates = Object.entries(valueGroups).filter(([, keys]) => keys.length > 1);

const unusedVars = definedVarsArr.filter(v => !usedVars.has(v));
const undefinedVars = usedVarsArr.filter(v => !definedVars.has(v));

section('Все найденные CSS переменные (используются в коде):', CYAN);
const DARK_GRAY = '\x1b[90m';
for (const v of usedVarsArr) {
  const usage = varUsageIndex[v];
  let firstLine = '';
  // Если переменная определена в variables.scss, ищем её строку определения
  let definedLine = null;
  if (definedVars.has(v)) {
    const variablesLines = variablesScss.split(/\r?\n/);
    for (let i = 0; i < variablesLines.length; i++) {
      if (variablesLines[i].includes(`${v}:`)) {
        definedLine = i + 1;
        break;
      }
    }
  }
  if (definedVars.has(v) && definedLine) {
    firstLine = `${ORANGE}→${RESET} ${BLUE}${VARIABLES_FILE}:${definedLine}${RESET}`;
  } else if (usage && usage.length) {
    firstLine = `${ORANGE}→${RESET} ${BLUE}${usage[0].file}:${usage[0].line}${RESET}`;
  } else if (definedVars.has(v)) {
    firstLine = `${ORANGE}→${RESET} ${RED}${VARIABLES_FILE}:?${RESET}`;
  }
  console.log(`${WHITE}${v}${RESET} ${firstLine}`);
  // usage: остальные места использования
  if (usage && usage.length) {
    const seenFiles = new Set();
    for (const u of usage) {
      if (!seenFiles.has(u.file)) {
        seenFiles.add(u.file);
        // Не дублируем первую строку, если совпадает с определением
        if (
          !(definedVars.has(v) && u.file === VARIABLES_FILE && u.line === definedLine)
        ) {
          console.log(`${DARK_GRAY}    ${u.file}:${u.line}${RESET}`);
        }
      }
    }
    console.log('');
  }
}
console.log('');

section('Неиспользуемые переменные из variables.scss:', YELLOW);
if (unusedVars.length) {
  const variablesLines = variablesScss.split(/\r?\n/);
  for (const v of unusedVars) {
    let definedLine = '?';
    for (let i = 0; i < variablesLines.length; i++) {
      if (variablesLines[i].includes(`${v}:`)) {
        definedLine = i + 1;
        break;
      }
    }
    console.log(
      `${WHITE}${v}${RESET} ${ORANGE}→${RESET} ${RED}${VARIABLES_FILE}:${definedLine}${RESET}`,
    );
  }
} else {
  console.log(`${GREEN}Нет${RESET}`);
}
console.log('');

section('Переменные, которые используются, но не определены в variables.scss:', MAGENTA);
if (undefinedVars.length) {
  for (const v of undefinedVars) {
    const usage = varUsageIndex[v];
    let firstUsage = '';
    if (usage && usage.length) {
      firstUsage = `${ORANGE}→${RESET} ${BLUE}${usage[0].file}:${usage[0].line}${RESET}`;
    }
    console.log(`${WHITE}${v}${RESET} ${firstUsage}`);
    if (usage && usage.length) {
      const seenFiles = new Set();
      for (const u of usage) {
        if (!seenFiles.has(u.file)) {
          seenFiles.add(u.file);
          if (!(u.file === usage[0].file && u.line === usage[0].line)) {
            console.log(`${DARK_GRAY}    ${u.file}:${u.line}${RESET}`);
          }
        }
      }
      console.log('');
    }
  }
} else {
  console.log(`${GREEN}Нет${RESET}`);
}
console.log('');

section('Дубликаты значений переменных:', RED);
if (duplicates.length) {
  for (const [value, keys] of duplicates) {
    console.log(`${RED + BOLD}Значение: ${value}${RESET}`);
    for (const key of keys) {
      const usage = varUsageIndex[key];
      if (usage && usage.length) {
        console.log(`${RED}  ${key}:${RESET}`);
        const DARK_GRAY = '\x1b[90m';
        for (const u of usage) {
          console.log(`${DARK_GRAY}    ${u.file}:${u.line}${RESET}`);
        }
      } else {
        console.log(`${RED}  ${key}: (не используется в src)${RESET}`);
      }
    }
    console.log(`${RED}--------------------${RESET}`);
  }
} else {
  console.log(`${GREEN}Нет дубликатов значений${RESET}`);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.resolve(projectRoot, 'src');
const localesDir = path.resolve(projectRoot, 'src/locales');

// Рекурсивное получение всех файлов
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Пропускаем node_modules и dist
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // Берём только .js, .ts, .vue файлы
      if (/\.(js|ts|vue|jsx|tsx)$/.test(filePath)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Извлечение всех ключей локализации из файла с номерами строк
function extractI18nKeys(content, filePath) {
  const keys = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    // Статические ключи
    let match;
    const lineRegex = /(?:t|tm)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = lineRegex.exec(line)) !== null) {
      keys.push({
        key: match[1],
        line: lineIndex + 1,
        filePath,
        column: match.index + 1,
        isDynamic: false,
      });
    }

    // Динамические ключи из комментариев
    let dynamicMatch;
    const dynamicRegex = /\/\/\s*i18n-keys:\s*([^\n]+)/g;
    while ((dynamicMatch = dynamicRegex.exec(line)) !== null) {
      const keysList = dynamicMatch[1]
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      keysList.forEach(key => {
        keys.push({
          key,
          line: lineIndex + 1,
          filePath,
          column: match ? match.index : 1,
          isDynamic: true,
        });
      });
    }
  });

  return keys;
}

// Получение всех доступных ключей из локалей
function getAllAvailableKeys() {
  const availableKeys = new Set();

  try {
    // Берём русскую локаль как базовую
    const ruPath = path.join(localesDir, 'ru.json');
    const ruContent = JSON.parse(fs.readFileSync(ruPath, 'utf-8'));

    function extractKeys(obj, prefix = '') {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extractKeys(value, fullKey);
        } else {
          availableKeys.add(fullKey);
        }
      });
    }

    extractKeys(ruContent);
  } catch (error) {
    console.error('Ошибка при чтении локалей:', error.message);
  }

  return availableKeys;
}

// Основная функция
function scanI18nKeys() {
  console.log('\n📋 Сканирование i18n ключей...\n');

  const files = getAllFiles(srcDir);
  const fileKeysMap = new Map();
  const allUsedKeys = new Map(); // Меняем на Map для хранения информации о строках

  // Сканируем файлы
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const keys = extractI18nKeys(content, file);

      if (keys.length > 0) {
        const relativePath = path.relative(srcDir, file);
        fileKeysMap.set(relativePath, keys);

        keys.forEach(keyInfo => {
          if (!allUsedKeys.has(keyInfo.key)) {
            allUsedKeys.set(keyInfo.key, []);
          }
          allUsedKeys.get(keyInfo.key).push(keyInfo);
        });
      }
    } catch (error) {
      console.error(`Ошибка при чтении ${file}:`, error.message);
    }
  });

  // Вывод таблицы файлов и ключей
  console.log('📁 ФАЙЛЫ И НАЙДЕННЫЕ КЛЮЧИ:');
  console.log('═'.repeat(120));

  const sortedFiles = Array.from(fileKeysMap.entries()).sort();

  sortedFiles.forEach(([file, keys]) => {
    console.log(`\n📄 ${file}`);
    console.log('─'.repeat(120));
    keys.forEach(keyInfo => {
      const vscodeLink = `vscode://file/${keyInfo.filePath}:${keyInfo.line}:${keyInfo.column}`;
      const dynamicBadge = keyInfo.isDynamic ? ' 🔄 [DYNAMIC]' : '';
      console.log(`   ${keyInfo.key}${dynamicBadge}`);
      console.log(`   ${vscodeLink}`);
      console.log('');
    });
  });

  // Получаем доступные ключи
  const availableKeys = getAllAvailableKeys();

  // Неиспользуемые ключи
  const unusedKeys = Array.from(availableKeys)
    .filter(key => !allUsedKeys.has(key))
    .sort();

  console.log(`\n\n${'═'.repeat(120)}`);
  console.log('⚠️  НЕИСПОЛЬЗУЕМЫЕ КЛЮЧИ:');
  console.log('═'.repeat(120));

  if (unusedKeys.length === 0) {
    console.log('\n✅ Все ключи используются!\n');
  } else {
    console.log(`\n🔴 Найдено ${unusedKeys.length} неиспользуемых ключей:\n`);
    unusedKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}`);
    });
    console.log();
  }

  // Статистика
  console.log('═'.repeat(120));
  console.log('📊 СТАТИСТИКА:');
  console.log('═'.repeat(120));
  console.log(`Файлов с ключами:      ${fileKeysMap.size}`);
  console.log(`Используемых ключей:   ${allUsedKeys.size}`);
  console.log(`Доступных ключей:      ${availableKeys.size}`);
  console.log(`Неиспользуемых ключей: ${unusedKeys.length}`);
  console.log(`${'═'.repeat(120)}\n`);
}

scanI18nKeys();

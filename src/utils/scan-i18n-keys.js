import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');
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

// Извлечение всех ключей локализации из файла
function extractI18nKeys(content) {
  const keys = new Set();

  // Ищем паттерны: t('key'), t("key"), tm('key'), tm("key")
  const regex = /(?:t|tm)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys);
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
  const allUsedKeys = new Set();

  // Сканируем файлы
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const keys = extractI18nKeys(content);

      if (keys.length > 0) {
        const relativePath = path.relative(srcDir, file);
        fileKeysMap.set(relativePath, keys);
        keys.forEach(key => allUsedKeys.add(key));
      }
    } catch (error) {
      console.error(`Ошибка при чтении ${file}:`, error.message);
    }
  });

  // Вывод таблицы файлов и ключей
  console.log('📁 ФАЙЛЫ И НАЙДЕННЫЕ КЛЮЧИ:');
  console.log('═'.repeat(100));

  const sortedFiles = Array.from(fileKeysMap.entries()).sort();

  sortedFiles.forEach(([file, keys]) => {
    console.log(`\n📄 ${file}`);
    console.log('─'.repeat(100));
    keys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}`);
    });
  });

  // Получаем доступные ключи
  const availableKeys = getAllAvailableKeys();

  // Неиспользуемые ключи
  const unusedKeys = Array.from(availableKeys)
    .filter(key => !allUsedKeys.has(key))
    .sort();

  console.log(`\n\n${'═'.repeat(100)}`);
  console.log('⚠️  НЕИСПОЛЬЗУЕМЫЕ КЛЮЧИ:');
  console.log('═'.repeat(100));

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
  console.log('═'.repeat(100));
  console.log('📊 СТАТИСТИКА:');
  console.log('═'.repeat(100));
  console.log(`Файлов с ключами:      ${fileKeysMap.size}`);
  console.log(`Используемых ключей:   ${allUsedKeys.size}`);
  console.log(`Доступных ключей:      ${availableKeys.size}`);
  console.log(`Неиспользуемых ключей: ${unusedKeys.length}`);
  console.log(`${'═'.repeat(100)}\n`);
}

scanI18nKeys();

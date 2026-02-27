import { onMounted } from 'vue';

const MACRULEZ_ASCII = [
  '╔═════════════════════════════════════════════════════════════════════════════════════════════════╗',
  '║                                                                                                 ║',
  '║  88b           d88                                                   88                         ║',
  '║  888b         d888                                                   88                         ║',
  "║  88`8b       d8'88                                                   88                         ║",
  "║  88 `8b     d8' 88  ,adPPYYba,   ,adPPYba,  8b,dPPYba,  88       88  88   ,adPPYba,  888888888  ║",
  '║  88  `8b   d8\'  88  ""     `Y8  a8"     ""  88P\'   "Y8  88       88  88  a8P_____88       a8P"  ║',
  '║  88   `8b d8\'   88  ,adPPPPP88  8b          88          88       88  88  8PP""""""     ,d8P\'    ║',
  '║  88    `888\'    88  88,    ,88  "8a,   ,aa  88          "8a,   ,a88  88  "8b,   ,aa   ,d8"      ║',
  '║  88     `8\'     88  `"8bbdP"Y8   `"Ybbd8\'   88           `"YbbdP\'Y8  88   `"Ybbd8\'   888888888  ║',
  '║                                                                                                 ║',
  '╚═════════════════════════════════════════════════════════════════════════════════════════════════╝',
].join('\n');

const FEATURES = [
  '🟩 Vue 3',
  '🧩 Composition API',
  '🛣️ Routing',
  '🍍 Pinia',
  '🌐 i18n',
  '🟦 TypeScript',
  '⚡ Vite',
];

export function useMacrulezBadge() {
  onMounted(() => {
    console.log(
      `%c${MACRULEZ_ASCII}`,
      'color: #00bfae; font-weight: bold; font-family: monospace;',
    );

    console.log(
      '%c\nFeatures:',
      'color: #00bfae; font-weight: bold; font-family: monospace;',
    );
    for (const feature of FEATURES) {
      console.log(`%c${feature}`, 'color: #00bfae; font-family: monospace;');
    }
  });
}


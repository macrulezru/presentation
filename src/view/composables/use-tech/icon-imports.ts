// Импорты всех SVG логотипов для use-tech
// ?url указывает Vite импортировать как URL файла, а не как содержимое
import bitrixLogo from '@/view/assets/images/bitrix-logo.svg?url';
import cssLogo from '@/view/assets/images/css-logo.svg?url';
import figmaLogo from '@/view/assets/images/figma-logo.svg?url';
import gitLogo from '@/view/assets/images/git-logo.svg?url';
import githubLogo from '@/view/assets/images/github-logo.svg?url';
import htmlLogo from '@/view/assets/images/html-logo.svg?url';
import i18nLogo from '@/view/assets/images/i18n-logo.svg?url';
import javascriptLogo from '@/view/assets/images/javascript-logo.svg?url';
import phpLogo from '@/view/assets/images/php-logo.svg?url';
import piniaLogo from '@/view/assets/images/pinia-logo.svg?url';
import svnLogo from '@/view/assets/images/svn-logo.svg?url';
import tsLogo from '@/view/assets/images/ts-logo.svg?url';
import viteLogo from '@/view/assets/images/vite-logo.svg?url';
import vueLogo from '@/view/assets/images/vue-logo.svg?url';

// Экспортируем карту с путями к логотипам
export const iconPaths: Record<string, string> = {
  bitrix: bitrixLogo,
  css: cssLogo,
  figma: figmaLogo,
  git: gitLogo,
  github: githubLogo,
  html: htmlLogo,
  i18n: i18nLogo,
  javascript: javascriptLogo,
  php: phpLogo,
  pinia: piniaLogo,
  svn: svnLogo,
  ts: tsLogo,
  typescript: tsLogo, // алиас для ts
  vite: viteLogo,
  vue: vueLogo,
};

// Импорты всех SVG логотипов для use-tech
// Vite автоматически обработает эти импорты и добавит хеши в production
import bitrixLogo from '@/view/assets/images/bitrix-logo.svg';
import cssLogo from '@/view/assets/images/css-logo.svg';
import figmaLogo from '@/view/assets/images/figma-logo.svg';
import gitLogo from '@/view/assets/images/git-logo.svg';
import githubLogo from '@/view/assets/images/github-logo.svg';
import htmlLogo from '@/view/assets/images/html-logo.svg';
import i18nLogo from '@/view/assets/images/i18n-logo.svg';
import javascriptLogo from '@/view/assets/images/javascript-logo.svg';
import phpLogo from '@/view/assets/images/php-logo.svg';
import piniaLogo from '@/view/assets/images/pinia-logo.svg';
import svnLogo from '@/view/assets/images/svn-logo.svg';
import tsLogo from '@/view/assets/images/ts-logo.svg';
import viteLogo from '@/view/assets/images/vite-logo.svg';
import vueLogo from '@/view/assets/images/vue-logo.svg';

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

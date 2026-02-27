import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnvFile(absPath: string) {
  if (!existsSync(absPath)) return {};

  const out: Record<string, string> = {};
  const raw = readFileSync(absPath, 'utf8');

  for (const line of raw.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (!path) return base;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

const nuxtDir = fileURLToPath(new URL('.', import.meta.url));
const rootEnv = loadDotEnvFile(resolve(nuxtDir, '.env'));
const env = (key: string) => process.env[key] ?? rootEnv[key];

const SITE_URL = env('VITE_APP_URL') || 'https://macrulez.ru';
const OG_IMAGE_PATH = env('VITE_APP_OG_IMAGE_PATH') || '/og-image.png';
const OG_IMAGE_URL = joinUrl(SITE_URL, OG_IMAGE_PATH);

export default defineNuxtConfig({
  ssr: true,

  // Для поэтапной миграции переиспользуем существующий код из /src,
  // где во всём проекте уже используется алиас "@/..."
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },

  css: [
    '@/view/styles/reset.scss',
    '@/view/styles/variables.scss',
    '@/view/styles/main.scss',
    '@/view/pages/index.scss',
  ],

  app: {
    head: {
      title: env('VITE_APP_TITLE') || '',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },

        { name: 'description', content: env('VITE_APP_DESCRIPTION') || '' },
        { name: 'keywords', content: env('VITE_APP_KEYWORDS') || '' },

        { name: 'apple-mobile-web-app-title', content: 'MyWebSite' },

        // OpenGraph
        { property: 'og:title', content: env('VITE_APP_OG_TITLE') || '' },
        { property: 'og:description', content: env('VITE_APP_OG_DESCRIPTION') || '' },
        { property: 'og:image', content: OG_IMAGE_URL },
        { property: 'og:image:width', content: env('VITE_APP_OG_IMAGE_WIDTH') || '' },
        { property: 'og:image:height', content: env('VITE_APP_OG_IMAGE_HEIGHT') || '' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: env('VITE_APP_OG_IMAGE_ALT') || '' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: env('VITE_APP_OG_SITE_NAME') || '' },

        // Twitter
        { name: 'twitter:card', content: env('VITE_APP_TWITTER_CARD') || '' },
        { name: 'twitter:title', content: env('VITE_APP_TWITTER_TITLE') || '' },
        { name: 'twitter:description', content: env('VITE_APP_TWITTER_DESCRIPTION') || '' },
        { name: 'twitter:image', content: OG_IMAGE_URL },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      style: [
        {
          innerHTML: `
.app-loader__wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #151515 0%, #0c0c0c 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 9999;
}

.app-loader__spinner {
  width: 180px;
  height: 180px;
  border: 12px solid #d941b0;
  border-top: 12px solid #ffffff;
  border-radius: 50%;
  animation: app-loader-spin 1s linear infinite;
  position: relative;
}

.app-loader__spinner::after {
  content: '';
  position: absolute;
  inset: 30px;
  border: 6px solid #f22ee5;
  border-top: 6px solid #ffffff;
  border-radius: 50%;
  animation: app-loader-spin-reverse 1.5s linear infinite;
}

@keyframes app-loader-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes app-loader-spin-reverse {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}
          `,
        },
      ],
    },
  },

  modules: [],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/view/styles/mixins/layout.scss" as *;
            @use "@/view/styles/mixins/media.scss" as *;
            @use "@/view/styles/mixins/element.scss" as *;
          `,
        },
      },
    },
  },

  nitro: {
    preset: 'node-server',
  },

  runtimeConfig: {
    macrulezApiBase: 'https://macrulez-api.ru/api',
    public: {},
  },
});


/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >;
  export default component;
}

// Типы для импортов
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';

// Типы для assets
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.ico';

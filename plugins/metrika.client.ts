export default defineNuxtPlugin(() => {
  const COUNTER_ID = 106173012;

  // Инициализация ym до загрузки скрипта (буферизация вызовов)
  const w = window as any;
  w.ym =
    w.ym ||
    function (...args: any[]) {
      (w.ym.a = w.ym.a || []).push(args);
    };
  w.ym.l = Date.now();

  // Загрузка скрипта tag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js`;
  document.head.appendChild(script);

  // Инициализация счётчика
  w.ym(COUNTER_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer',
  });

  // Отправка hit при клиентских SPA-переходах
  const router = useRouter();
  router.afterEach(to => {
    w.ym(COUNTER_ID, 'hit', to.fullPath);
  });
});

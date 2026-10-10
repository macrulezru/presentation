<script setup lang="ts">
  import { onMounted, onUnmounted, defineAsyncComponent, computed } from 'vue';

  import { LocalesList } from '@/enums/locales.enum';
  import { PageSectionsEnum } from '@/enums/page-sections.enum';
  import { i18n } from '@/locales';
  import Header from '@/view/components/header/header.vue';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing';
  import { useMacrulezBadge } from '~/composables/useMacrulezBadge';
  import { useSectionsConfig } from '~/composables/useSectionsConfig';

  const MetricsPanel = defineAsyncComponent(
    () => import('@/view/components/metrics/metrics-panel.vue'),
  );

  const { t } = i18n.global;

  const route = useRoute();
  const locale = computed(() => String(route.params.locale || 'ru'));
  const localeUrl = (code: string) =>
    code === 'ru' ? 'https://macrulez.ru/' : `https://macrulez.ru/${code}`;
  const canonicalUrl = computed(() => localeUrl(locale.value));
  const alternateLinks = [
    ...LocalesList.map(code => ({
      rel: 'alternate',
      hreflang: code,
      href: localeUrl(code),
    })),
    { rel: 'alternate', hreflang: 'x-default', href: localeUrl('ru') },
  ];

  const seoTitle = computed(() => String(t('seo.title')));
  const seoDescription = computed(() => String(t('seo.description')));

  useHead(() => ({
    htmlAttrs: { lang: locale.value },
    title: seoTitle.value,
    link: [{ rel: 'canonical', href: canonicalUrl.value }, ...alternateLinks],
    meta: [{ name: 'description', content: seoDescription.value }],
    script: [
      {
        type: 'application/ld+json',
        key: 'person-schema',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': 'https://macrulez.ru/#person',
          name: 'Данил Лисин',
          url: 'https://macrulez.ru',
          image: 'https://macrulez.ru/og-image.png',
          jobTitle: 'Frontend Developer',
          description: String(t('seo.description')),
          knowsAbout: [
            'Vue.js',
            'Nuxt.js',
            'TypeScript',
            'Frontend Architecture',
            'SPA Development',
            'Performance Optimization',
          ],
          sameAs: [
            'https://github.com/macrulezru',
            'https://t.me/Danil_Anapa',
            'https://vuecraft.ru',
            'https://blog.macrulez.ru',
            'https://www.npmjs.com/~macrulez',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'danil@macrulez.ru',
            contactType: 'professional',
          },
        }),
      },
    ],
  }));

  // Nuxt SSR data (попадает в payload, чтобы гидрация совпала с HTML)
  const { data: experienceRes } = await usePortfolioExperience(locale);
  const { data: npmRes } = await usePortfolioNpmPackages(locale);
  const { data: blogRes } = await usePortfolioBlog();
  const { data: artsRes } = await usePortfolioArts();

  const { init, destroy } = useScrollRouting();
  const { sectionsConfig } = useSectionsConfig();

  useSeoMeta({
    ogUrl: canonicalUrl,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
  });

  useMacrulezBadge();

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    destroy();
  });
</script>

<template>
  <div class="app">
    <Header />
    <section v-for="section in sectionsConfig" :id="section.id" :key="section.id">
      <component
        :is="section.component"
        v-bind="
          section.id === PageSectionsEnum.EXPERIENCE
            ? experienceRes?.success
              ? { ssrItems: experienceRes.data || [] }
              : {}
            : section.id === PageSectionsEnum.ARTS
              ? artsRes?.success
                ? { ssrArts: artsRes.data || [] }
                : {}
              : section.id === PageSectionsEnum.STUFF
                ? {
                    ...(npmRes?.success ? { ssrNpmItems: npmRes.data || [] } : {}),
                    ...(blogRes?.success ? { ssrBlogItems: blogRes.data || [] } : {}),
                  }
                : {}
        "
      />
    </section>
  </div>
  <component :is="MetricsPanel" />
</template>

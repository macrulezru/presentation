<script setup lang="ts">
  const { t } = useI18n()

  const technologies = computed(() => [
    {
      icon: 'js',
      description: t('tech.javascript'),
    },
    {
      icon: 'vue',
      description: t('tech.vue'),
    },
    {
      icon: 'ts',
      description: t('tech.typescript'),
    },
    {
      icon: 'pinia',
      description: t('tech.pinia'),
    },
    {
      icon: 'vite',
      description: t('tech.vite'),
    },
    {
      icon: 'i18n',
      description: t('tech.i18n'),
    },
    {
      icon: 'html',
      description: t('tech.html'),
    },
    {
      icon: 'css',
      description: t('tech.css'),
    },
  ])
</script>

<template>
  <div class="about">
    <div class="about__tech-wrapper">
      <div v-for="tech in technologies" :key="tech.icon" class="about__tech-item">
        <div
          class="about__tech-item-icon"
          :class="`about__tech-item-icon_${tech.icon}`"
        />
        <div class="about__tech-item-description">{{ tech.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .about {
  }

  .about__tech-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .about__tech-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  .about__tech-item-icon {
    margin-bottom: 0.5rem;
    width: 50px;
    height: 50px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .about__tech-item-icon_js {
    background-image: url('@/assets/images/javascript-logo.svg');
  }

  .about__tech-item-icon_vue {
    background-image: url('@/assets/images/vue-logo.svg');
  }

  .about__tech-item-icon_ts {
    background-image: url('@/assets/images/ts-logo.svg');
  }

  .about__tech-item-icon_pinia {
    background-image: url('@/assets/images/pinia-logo.svg');
  }

  .about__tech-item-icon_vite {
    background-image: url('@/assets/images/vite-logo.svg');
  }

  .about__tech-item-icon_i18n {
    background-image: url('@/assets/images/i18n-logo.svg');
  }

  .about__tech-item-icon_html {
    background-image: url('@/assets/images/html-logo.svg');
  }

  .about__tech-item-icon_css {
    background-image: url('@/assets/images/css-logo.svg');
  }

  .about__tech-item-description {
    font-size: 0.8rem;
    color: #5a6c7d;
    line-height: 1.3;
  }

  @media (max-width: 768px) {
    .about__tech-wrapper {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .about__tech-item {
      padding: 0.75rem;
    }

    .about__tech-item-icon {
      font-size: 1rem;
    }

    .about__tech-item-description {
      font-size: 0.75rem;
    }
  }
</style>

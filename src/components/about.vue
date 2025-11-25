<script setup lang="ts">
  const { t, tm } = useI18n()

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

  const skillsList = computed(() => tm('about.skills_list'))
</script>

<template>
  <div class="about">
    <div class="about__intro">
      <p class="about__intro-lead">{{ t('about.intro') }}</p>
      <p>{{ t('about.approach') }}</p>

      <div class="about__skills">
        <p class="about__skills-title">{{ t('about.skills_title') }}</p>
        <ul class="about__skills-list">
          <li
            v-for="(skill, index) in skillsList"
            :key="index"
            class="about__skills-item"
          >
            <span class="about__skill-title">{{ skill.title }}</span>
            <span class="about__skill-description">{{ skill.description }}</span>
          </li>
        </ul>
        <p class="about__skills-conclusion">{{ t('about.conclusion') }}</p>
      </div>
    </div>

    <h3 class="about__tech-title">{{ t('about.tech_title') }}</h3>

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
    margin: 0 auto;
    padding: 20px;
    max-width: 800px;
  }

  .about__intro {
    line-height: 1.6;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .about__intro p {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .about__intro-lead {
    font-weight: 600;
    font-size: 1.2rem;
    color: #2c3e50;
  }

  .about__skills {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
  }

  .about__skills-title {
    margin-bottom: 1rem !important;
    font-weight: 500;
  }

  .about__skills-list {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .about__skills-item {
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .about__skills-item:last-child {
    margin-bottom: 0;
  }

  .about__skill-title {
    display: block;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .about__skill-description {
    display: block;
    color: #5a6c7d;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .about__skills-conclusion {
    margin-top: 1.5rem !important;
    font-style: italic;
  }

  .about__tech-title {
    text-align: center;
    margin: 3rem 0 1.5rem 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .about__tech-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    margin-top: 0;
    border-radius: 10px;
    border: solid 1px #bdbdbd;
    padding: 1.5rem;
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
    font-size: 0.7rem;
    color: #5a6c7d;
    line-height: 1.3;
  }

  @media (max-width: 768px) {
    .about__intro {
      font-size: 1rem;
      padding: 0 1rem;
    }

    .about__skills {
      padding: 1rem;
      margin: 1.5rem 0;
    }

    .about__skills-list {
      padding-left: 1rem;
    }

    .about__tech-title {
      font-size: 1.3rem;
      margin: 2rem 0 1rem 0;
    }

    .about__tech-wrapper {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

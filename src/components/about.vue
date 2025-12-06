<script setup lang="ts">
  import { ref } from 'vue'

  const { t, tm } = useI18n()

  const container = ref<HTMLElement>()

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
    {
      icon: 'figma',
      description: t('tech.figma'),
    },
    {
      icon: 'php',
      description: t('tech.php'),
    },
    {
      icon: 'bitrix',
      description: t('tech.bitrix'),
    },
    {
      icon: 'git',
      description: t('tech.git'),
    },
    {
      icon: 'svn',
      description: t('tech.svn'),
    },
  ])

  const skillsList = computed(() => tm('about.skills_list'))

  defineExpose({ container })
</script>

<template>
  <div ref="container" class="about">
    <div class="about__container">
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

      <div class="about__tech-stack-details">
        <h3 class="about__tech-stack-title">{{ t('about.tech_stack_title') }}</h3>

        <div class="about__tech-category">
          <h4 class="about__tech-category-title">{{ t('about.main_tech_title') }}</h4>
          <ul class="about__tech-list">
            <li
              v-for="(item, index) in tm('about.main_tech_list')"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title">{{ item.title }}</span>
              <span class="about__tech-item-description">{{ item.description }}</span>
            </li>
          </ul>
        </div>

        <div class="about__tech-category">
          <h4 class="about__tech-category-title">{{ t('about.infra_tech_title') }}</h4>
          <ul class="about__tech-list">
            <li
              v-for="(item, index) in tm('about.infra_tech_list')"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title">{{ item.title }}</span>
              <span class="about__tech-item-description">{{ item.description }}</span>
            </li>
          </ul>
        </div>

        <div class="about__tech-category">
          <h4 class="about__tech-category-title">{{ t('about.layout_tech_title') }}</h4>
          <ul class="about__tech-list">
            <li
              v-for="(item, index) in tm('about.layout_tech_list')"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title">{{ item.title }}</span>
              <span class="about__tech-item-description">{{ item.description }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Блок про Bitrix опыт -->
      <div class="about__bitrix">
        <h3 class="about__bitrix-title">{{ t('about.bitrix_title') }}</h3>
        <p class="about__bitrix-description">{{ t('about.bitrix_description') }}</p>
        <ul class="about__bitrix-skills">
          <li
            v-for="(skill, index) in tm('about.bitrix_skills')"
            :key="index"
            class="about__bitrix-skill"
          >
            {{ skill }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .about {
    padding: var(--spacing-xl) 0;
  }

  .about__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .about__intro {
    line-height: 1.6;
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
  }

  .about__intro p {
    margin-bottom: var(--spacing-lg);
    text-align: left;
  }

  .about__intro-lead {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-3xl);
    color: var(--color-text-primary);
  }

  .about__bitrix {
    background: var(--color-bg-secondary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    margin: var(--spacing-xl) 0 0;
  }

  .about__bitrix-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .about__bitrix-description {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
  }

  .about__bitrix-skills {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .about__bitrix-skill {
    position: relative;
    padding-left: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
    line-height: 1.5;
  }

  .about__bitrix-skill::before {
    content: '•';
    position: absolute;
    left: 0;
    font-weight: var(--font-weight-bold);
  }

  .about__bitrix-skill:last-child {
    margin-bottom: 0;
  }

  .about__skills {
    background: var(--color-bg-secondary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    margin: var(--spacing-xl) 0;
  }

  .about__skills-title {
    margin-bottom: var(--spacing-md) !important;
    font-weight: var(--font-weight-medium);
  }

  .about__skills-list {
    margin: var(--spacing-md) 0;
    padding-left: var(--spacing-lg);
    list-style: none;
  }

  .about__skills-item {
    margin-bottom: var(--spacing-lg);
    line-height: 1.5;
    position: relative;
    padding-left: var(--spacing-md);
  }

  .about__skills-item::before {
    content: '•';
    position: absolute;
    left: 0;
    top: 0;
    color: #8e9ba7;
    font-size: var(--font-size-xl);
    line-height: 1.5;
  }

  .about__skills-item:last-child {
    margin-bottom: 0;
  }

  .about__skill-title {
    display: block;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .about__skill-description {
    display: block;
    color: var(--color-text-secondary);
    font-size: var(--font-size-base);
    line-height: 1.4;
  }

  .about__skills-conclusion {
    margin-top: var(--spacing-lg) !important;
    font-style: italic;
  }

  .about__tech-title {
    text-align: center;
    margin: var(--spacing-3xl) 0 var(--spacing-lg) 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
  }

  .about__tech-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    border-radius: 10px;
    border: solid 1px var(--color-border-muted);
    padding: var(--spacing-lg);
  }

  .about__tech-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--spacing-md);
  }

  .about__tech-item-icon {
    margin-bottom: var(--spacing-sm);
    width: var(--icon-size-xl);
    height: var(--icon-size-xl);
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

  .about__tech-item-icon_php {
    background-image: url('@/assets/images/php-logo.svg');
  }

  .about__tech-item-icon_bitrix {
    background-image: url('@/assets/images/bitrix-logo.svg');
  }

  .about__tech-item-icon_git {
    background-image: url('@/assets/images/git-logo.svg');
  }

  .about__tech-item-icon_svn {
    background-image: url('@/assets/images/svn-logo.svg');
  }

  .about__tech-item-icon_figma {
    background-image: url('@/assets/images/figma-logo.svg');
  }

  .about__tech-item-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    line-height: 1.3;
  }

  .about__tech-stack-details {
    background: var(--color-bg-secondary);
    padding: var(--spacing-xl);
    border-radius: var(--radius-md);
    margin: var(--spacing-xl) 0;
  }

  .about__tech-stack-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  .about__tech-category {
    margin-bottom: var(--spacing-xl);
  }

  .about__tech-category:last-child {
    margin-bottom: 0;
  }

  .about__tech-category-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-normal);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }

  .about__tech-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .about__tech-list-item {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-primary);
    border-radius: var(--radius-sm);
  }

  .about__tech-list-item:last-child {
    margin-bottom: 0;
  }

  .about__tech-item-title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-lg);
  }

  .about__tech-item-description {
    color: var(--color-text-secondary);
    line-height: 1.5;
    font-size: var(--font-size-base);
  }

  @media (max-width: 768px) {
    .about {
      padding: var(--spacing-md) 0;
    }

    .about__container {
      padding: 0 var(--spacing-lg);
    }

    .about__intro {
      font-size: var(--font-size-md);
    }

    .about__bitrix {
      padding: var(--spacing-md);
      margin: var(--spacing-lg) 0;
    }

    .about__skills {
      padding: var(--spacing-md);
      margin: var(--spacing-lg) 0;
    }

    .about__skills-list {
      padding-left: var(--spacing-md);
    }

    .about__tech-title {
      font-size: var(--font-size-2xl);
      margin: var(--spacing-xl) 0 var(--spacing-md) 0;
    }

    .about__tech-wrapper {
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      padding: var(--spacing-md);
    }

    .about__tech-item {
      padding: var(--spacing-sm);
    }

    .about__tech-item-description {
      font-size: var(--font-size-sm);
    }

    .about__tech-stack-details {
      padding: var(--spacing-lg);
      margin: var(--spacing-lg) 0;
    }

    .about__tech-stack-title {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-lg);
    }

    .about__tech-category-title {
      font-size: var(--font-size-lg);
    }

    .about__tech-list-item {
      padding: var(--spacing-sm);
    }

    .about__tech-item-title {
      font-size: var(--font-size-md);
    }
  }

  @media (max-width: 480px) {
    .about__container {
      padding: 0 var(--spacing-lg);
    }

    .about__tech-wrapper {
      padding: var(--spacing-sm);
    }

    .about__tech-item {
      padding: var(--spacing-xs);
    }

    .about__tech-stack-details {
      padding: var(--spacing-md);
    }
  }
</style>

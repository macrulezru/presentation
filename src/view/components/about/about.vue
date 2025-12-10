<script setup lang="ts">
  import '@/view/components/about/about.scss'

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

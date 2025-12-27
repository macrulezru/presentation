<script setup lang="ts">
  import '@/view/components/about/about.scss';

  import { computed, ref } from 'vue';

  import { useI18n } from '@/view/composables/use-i18n';

  const { t, tm } = useI18n();

  const container = ref<HTMLElement>();

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
  ]);

  const skillsList = computed(() => (tm('about.skills_list') as any[]) || []);
  const mainTechList = computed(() => (tm('about.main_tech_list') as any[]) || []);
  const infraTechList = computed(() => (tm('about.infra_tech_list') as any[]) || []);
  const layoutTechList = computed(() => (tm('about.layout_tech_list') as any[]) || []);
  const bitrixSkills = computed(() => (tm('about.bitrix_skills') as any[]) || []);

  defineExpose({ container });
</script>

<template>
  <div ref="container" class="about">
    <div class="about__container">
      <div class="about__intro">
        <div class="about__intro-lead">
          <span class="about__intro-lead-item about__intro-lead_front-end">
            <span class="about__intro-lead-icon about__intro-lead-icon_front-end"></span>
            {{ t('about.intro.front-end') }}
          </span>
          <span class="about__intro-lead-item about__intro-lead_vue">
            <span class="about__intro-lead-icon about__intro-lead-icon_vue"></span>
            {{ t('about.intro.vue') }}
          </span>
          <span class="about__intro-lead-item about__intro-lead_web">
            <span class="about__intro-lead-icon about__intro-lead-icon_web"></span>
            {{ t('about.intro.web') }}
          </span>
        </div>
        <div>{{ t('about.approach') }}</div>

        <div class="about__skills">
          <div class="about__skills-title">{{ t('about.skills_title') }}</div>
          <div class="about__skills-list">
            <div
              v-for="(skill, index) in skillsList"
              :key="index"
              class="about__skills-list-item"
            >
              <span class="about__skill-title">{{ skill.title }}</span>
              <span class="about__skill-description">{{ skill.description }}</span>
            </div>
          </div>
          <div class="about__skills-conclusion">{{ t('about.conclusion') }}</div>
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
              v-for="(item, index) in mainTechList"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title about__tech-item-title_tech">
                {{ item.title }}
              </span>
              <span class="about__tech-item-description_big">{{ item.description }}</span>
            </li>
          </ul>
        </div>

        <div class="about__tech-category">
          <h4 class="about__tech-category-title">{{ t('about.infra_tech_title') }}</h4>
          <ul class="about__tech-list">
            <li
              v-for="(item, index) in infraTechList"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title about__tech-item-title_tool">
                {{ item.title }}
              </span>
              <span class="about__tech-item-description_big">{{ item.description }}</span>
            </li>
          </ul>
        </div>

        <div class="about__tech-category">
          <h4 class="about__tech-category-title">{{ t('about.layout_tech_title') }}</h4>
          <ul class="about__tech-list">
            <li
              v-for="(item, index) in layoutTechList"
              :key="index"
              class="about__tech-list-item"
            >
              <span class="about__tech-item-title about__tech-item-title_style">
                {{ item.title }}
              </span>
              <span class="about__tech-item-description_big">{{ item.description }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="about__bitrix">
        <h3 class="about__bitrix-title">{{ t('about.bitrix_title') }}</h3>
        <p class="about__bitrix-description">{{ t('about.bitrix_description') }}</p>
        <ul class="about__bitrix-skills">
          <li
            v-for="(skill, index) in bitrixSkills"
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

<script setup lang="ts">
  const { t, tm } = useI18n()

  const features = computed(() => tm('travelshop.features.items'))
  const techStack = computed(() => tm('travelshop.tech_stack.items'))
  const achievements = computed(() => tm('travelshop.achievements.items'))
  const projects = computed(() => tm('travelshop.projects.items'))
</script>

<template>
  <div class="travelshop">
    <div class="travelshop__header">
      <h2 class="travelshop__title">{{ t('travelshop.title') }}</h2>
      <div class="travelshop__meta">
        <span class="travelshop__role">{{ t('travelshop.role') }}</span>
        <span class="travelshop__period">{{ t('travelshop.period') }}</span>
      </div>
      <p class="travelshop__description">{{ t('travelshop.description') }}</p>
    </div>

    <div class="travelshop__content">
      <!-- Ключевые функции -->
      <div class="travelshop__section">
        <h3 class="travelshop__section-title">{{ t('travelshop.features.title') }}</h3>
        <div class="travelshop__features">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="travelshop__feature"
          >
            <div class="travelshop__feature-icon">⚡</div>
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>

      <!-- Технологический стек -->
      <div class="travelshop__section">
        <h3 class="travelshop__section-title">{{ t('travelshop.tech_stack.title') }}</h3>
        <div class="travelshop__tech-stack">
          <div
            v-for="(tech, index) in techStack"
            :key="index"
            class="travelshop__tech-item"
          >
            <div class="travelshop__tech-dot"></div>
            <span>{{ tech }}</span>
          </div>
        </div>
      </div>

      <!-- Достижения -->
      <div class="travelshop__section">
        <h3 class="travelshop__section-title">
          {{ t('travelshop.achievements.title') }}
        </h3>
        <div class="travelshop__achievements">
          <div
            v-for="(achievement, index) in achievements"
            :key="index"
            class="travelshop__achievement"
          >
            <div class="travelshop__achievement-number">{{ index + 1 }}</div>
            <div class="travelshop__achievement-content">
              {{ achievement }}
            </div>
          </div>
        </div>
      </div>

      <!-- Проекты -->
      <div class="travelshop__section">
        <h3 class="travelshop__section-title">{{ t('travelshop.projects.title') }}</h3>
        <div class="travelshop__projects">
          <a
            v-for="(project, index) in projects"
            :key="index"
            :href="project.url"
            target="_blank"
            class="travelshop__project"
          >
            <div class="travelshop__project-header">
              <h4 class="travelshop__project-name">{{ project.name }}</h4>
              <div class="travelshop__project-arrow">↗</div>
            </div>
            <p class="travelshop__project-description">{{ project.description }}</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .travelshop {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .travelshop__header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .travelshop__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .travelshop__meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .travelshop__role {
    background: #3498db;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .travelshop__period {
    color: #7f8c8d;
    font-weight: 500;
  }

  .travelshop__description {
    font-size: 1.2rem;
    color: #5a6c7d;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  .travelshop__content {
    display: grid;
    gap: 3rem;
  }

  .travelshop__section {
    background: white;
    border-radius: 16px;
  }

  .travelshop__section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f1f3f4;
  }

  /* Стили для функций */
  .travelshop__features {
    display: grid;
    gap: 1rem;
  }

  .travelshop__feature {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .travelshop__feature-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  /* Стили для технологического стека */
  .travelshop__tech-stack {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .travelshop__tech-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .travelshop__tech-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3498db;
    flex-shrink: 0;
  }

  /* Стили для достижений */
  .travelshop__achievements {
    display: grid;
    gap: 1.5rem;
  }

  .travelshop__achievement {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .travelshop__achievement-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }

  .travelshop__achievement-content {
    flex: 1;
    padding-top: 0.5rem;
    line-height: 1.6;
    color: #5a6c7d;
  }

  /* Стили для проектов */
  .travelshop__projects {
    display: flex;
    gap: 1.5rem;
  }

  .travelshop__project {
    display: block;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

  .travelshop__project:hover {
    background: white;
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
  }

  .travelshop__project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .travelshop__project-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .travelshop__project-arrow {
    font-size: 1.2rem;
    color: #3498db;
  }

  .travelshop__project-description {
    color: #5a6c7d;
    line-height: 1.5;
    margin: 0;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .travelshop {
      padding: 1rem 0.5rem;
    }

    .travelshop__title {
      font-size: 2rem;
    }

    .travelshop__meta {
      flex-direction: column;
      gap: 1rem;
    }

    .travelshop__description {
      padding: 0 1rem;
      font-size: 1.1rem;
    }

    .travelshop__section {
      padding: 1rem;
    }

    .travelshop__projects {
      flex-direction: column;
    }

    .travelshop__tech-stack {
      grid-template-columns: 1fr;
    }

    .travelshop__achievement {
      gap: 1rem;
    }

    .travelshop__achievement-number {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .travelshop__title {
      font-size: 1.75rem;
    }

    .travelshop__section {
      padding: 1.25rem;
    }

    .travelshop__feature {
      padding: 0.75rem;
    }
  }
</style>

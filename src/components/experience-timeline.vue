<script setup lang="ts">
  const { t, tm } = useI18n()

  const experienceItems = computed(() => tm('experience.items'))
</script>

<template>
  <div class="experience">
    <div class="experience__container">
      <h2 class="experience__title">{{ t('experience.title') }}</h2>

      <div class="experience__timeline">
        <div
          v-for="(item, index) in experienceItems"
          :key="index"
          class="experience__item"
        >
          <!-- Точка на временной линии -->
          <div class="experience__timeline-dot"></div>

          <!-- Содержимое карточки -->
          <div class="experience__card">
            <div class="experience__period">{{ item.period }}</div>

            <div class="experience__card-header">
              <h3 class="experience__company">{{ item.company }}</h3>
              <span class="experience__duration">{{ item.duration }}</span>
            </div>

            <div class="experience__position">{{ item.position }}</div>

            <div class="experience__description">
              {{ item.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .experience {
    padding: 2rem 0;
  }

  .experience__container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .experience__title {
    text-align: center;
    margin-bottom: 4rem;
    color: #2c3e50;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .experience__timeline {
    position: relative;
    padding-left: 2rem;
  }

  /* Вертикальная линия таймлайна */
  .experience__timeline::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 5px;
    bottom: 0;
    width: 1px;
    background: #e1e5e9;
  }

  .experience__item {
    position: relative;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: flex-start;
  }

  .experience__item:last-child {
    margin-bottom: 0;
  }

  /* Точка на таймлайне */
  .experience__timeline-dot {
    position: absolute;
    left: -1.87rem;
    top: 0.25rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3498db;
    z-index: 2;
  }

  /* Карточка с контентом */
  .experience__card {
    background: white;
    border-radius: 12px;
    padding: 0;
    margin-left: 0.5rem;
    flex: 1;
  }

  .experience__period {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .experience__card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }

  .experience__company {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    line-height: 1.2;
  }

  .experience__duration {
    background: #f8f9fa;
    color: #5a6c7d;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid #e9ecef;
  }

  .experience__position {
    font-size: 1.1rem;
    font-weight: 500;
    color: #34495e;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .experience__description {
    color: #5a6c7d;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  /* Анимация появления */
  .experience__item {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Задержка для анимации каждого элемента */
  .experience__item:nth-child(1) {
    animation-delay: 0.1s;
  }
  .experience__item:nth-child(2) {
    animation-delay: 0.2s;
  }
  .experience__item:nth-child(3) {
    animation-delay: 0.3s;
  }
  .experience__item:nth-child(4) {
    animation-delay: 0.4s;
  }
  .experience__item:nth-child(5) {
    animation-delay: 0.5s;
  }

  /* Стили для мобильных устройств */
  @media (max-width: 768px) {
    .experience {
      padding: 1rem 0;
    }

    .experience__container {
      padding: 0 0.5rem;
    }

    .experience__title {
      font-size: 2rem;
      margin-bottom: 3rem;
    }

    .experience__timeline {
      padding-left: 1.5rem;
    }

    .experience__timeline::before {
      left: 0.25rem;
    }

    .experience__timeline-dot {
      left: -1.55rem;
      width: 10px;
      height: 10px;
    }

    .experience__card {
      margin-left: 0.5rem;
    }

    .experience__card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .experience__company {
      font-size: 1.15rem;
    }

    .experience__duration {
      align-self: flex-start;
    }

    .experience__position {
      font-size: 1rem;
    }

    .experience__description {
      font-size: 0.9rem;
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 480px) {
    .experience__container {
      padding: 0 0.75rem;
    }

    .experience__timeline {
      padding-left: 1.25rem;
    }

    .experience__timeline::before {
      left: 0.125rem;
    }

    .experience__timeline-dot {
      left: -1rem;
    }

    .experience__company {
      font-size: 1.1rem;
    }

    .experience__position {
      font-size: 0.95rem;
    }
  }
</style>

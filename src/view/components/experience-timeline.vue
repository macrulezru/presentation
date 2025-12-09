<script setup lang="ts">
  import { ref, computed } from 'vue'
  const { t, tm } = useI18n()

  const experienceItems = computed(() => tm('experience.items'))
  const showAll = ref(false)

  // Показываем только первые 4 компании, если не нажата кнопка "Показать все"
  const displayedItems = computed(() => {
    return showAll.value ? experienceItems.value : experienceItems.value.slice(0, 4)
  })

  // Проверяем, есть ли скрытые элементы
  const hasMore = computed(() => experienceItems.value.length > 4 && !showAll.value)
</script>

<template>
  <div class="experience">
    <div class="experience__container">
      <h2 class="experience__title">{{ t('experience.title') }}</h2>

      <div class="experience__timeline">
        <div
          v-for="(item, index) in displayedItems"
          :key="index"
          class="experience__item"
        >
          <!-- Содержимое карточки -->
          <div class="experience__card">
            <!-- Период (только если есть) -->
            <div v-if="item.period" class="experience__period">
              {{ item.period }}
            </div>

            <div class="experience__card-header">
              <h3 class="experience__company">{{ item.company }}</h3>
              <!-- Длительность (только если есть) -->
              <span v-if="item.duration" class="experience__duration">
                {{ item.duration }}
              </span>
            </div>

            <div class="experience__position">{{ item.position }}</div>

            <div class="experience__description">
              {{ item.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка "Показать все компании" -->
      <div v-if="hasMore" class="experience__button-container">
        <button @click="showAll = true" class="experience__button">
          {{ t('experience.showAllButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

  .experience__item::before {
    content: '';
    position: absolute;
    left: -1.85rem;
    top: 0.25rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3498db;
    z-index: 2;
  }

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

  /* Контейнер для кнопки */
  .experience__button-container {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
  }

  /* Стили кнопки */
  .experience__button {
    width: 100%;
    padding: 0.75rem 2rem;
    background: #ffffff;
    color: var(--color-secondary);
    border: solid 2px var(--color-secondary);
    border-radius: 14px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .experience__button:hover {
    color: #ffffff;
    background: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  .experience__button:active {
    transform: translateY(0);
  }

  @include media-tablet {
    .experience {
      padding: 1rem 0;
    }

    .experience__container {
      padding: 0 1.5rem;
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

    .experience__item::before {
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

    .experience__button {
      padding: 0.6rem 1.5rem;
      font-size: 0.95rem;
    }

    .experience__button-container {
      margin-top: 2.5rem;
    }
  }

  @include media-mobile {
    .experience__container {
      padding: 0 0.75rem;
    }

    .experience__timeline {
      padding-left: 1.25rem;
    }

    .experience__timeline::before {
      left: 0.125rem;
    }

    .experience__item::before {
      left: -22px;
    }

    .experience__company {
      font-size: 1.1rem;
    }

    .experience__position {
      font-size: 0.95rem;
    }

    .experience__button {
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  }
</style>

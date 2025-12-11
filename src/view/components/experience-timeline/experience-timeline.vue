<script setup lang="ts">
  import '@/view/components/experience-timeline/experience-timeline.scss'

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
              <div>
                <h3 class="experience__company">
                  {{ item.company }}
                </h3>
                <template v-if="item.url">
                  <div class="experience__link">
                    <a :href="item.url" target="_blank">
                      {{ item.url }}
                    </a>
                  </div>
                </template>
              </div>
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

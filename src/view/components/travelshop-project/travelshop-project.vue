<script setup lang="ts">
  import CircleChart from '@/view/ui/ui-circle-chart/ui-circle-chart.vue'
  import LoadingSpinner from '@/view/ui/ui-loading-spinner/ui-loading-spinner.vue'
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue'
  import Button from '@/view/ui/ui-button/ui-button.vue'

  import '@/view/components/travelshop-project/travelshop-project.scss'

  import { ref } from 'vue'

  import airportImage from '@/view/assets/images/airport.png'
  import aircraftImage from '@/view/assets/images/aircraft.png'
  import cloudImage from '@/view/assets/images/cloud.png'

  const TravelshopImages = defineAsyncComponent({
    loader: () =>
      import(
        '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.vue'
      ),
    loadingComponent: LoadingSpinner,
    delay: 200,
    timeout: 10000,
    errorComponent: {
      template: `
        <div class="travelshop__error">
          <p>{{ $t('travelshop.loading_error') }}</p>
        </div>
      `,
    },
  })

  const { t, tm } = useI18n()

  const showSwiper = ref<boolean>(false)
  const travelshopClouds = ref<HTMLElement>()
  const clouds = ref<HTMLImageElement[]>([])
  const cloudGenerationInterval = ref<number>()

  const features = computed(() => tm('travelshop.features.items'))

  const techStack = computed(() => tm('travelshop.tech_stack.items'))

  const projects = computed(() => tm('travelshop.projects.items'))

  const achievementsGraphs = computed(() => [
    {
      value: 40,
      color: '#dd5406',
      text: t('travelshop.achievements.items.scalable_architecture'),
    },
    {
      value: 60,
      color: '#078e2d',
      text: t('travelshop.achievements.items.error_reduction'),
    },
    {
      value: 25,
      color: '#048eed',
      text: t('travelshop.achievements.items.performance_improvement'),
    },
  ])

  const toggleSwiper = () => {
    showSwiper.value = !showSwiper.value
  }

  // Функция для создания одного облака с возможностью предварительного позиционирования
  const createCloud = (preWarm: boolean = false) => {
    if (!travelshopClouds.value) return

    const cloud = document.createElement('img')
    cloud.src = cloudImage
    cloud.classList.add('travelshop__cloud')

    const minSize = 40
    const maxSize = 120
    const minSpeed = 30
    const maxSpeed = 80
    const minTop = 5
    const maxTop = 35

    const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize
    const speed = Math.floor(Math.random() * (maxSpeed - minSpeed)) + minSpeed
    const top = Math.floor(Math.random() * (maxTop - minTop)) + minTop

    cloud.style.width = `${size}px`
    cloud.style.height = 'auto'
    cloud.style.top = `${top}%`
    cloud.style.opacity = `${0.4 + Math.random() * 0.8}`

    // Для предварительного прогрева: случайное начальное положение в видимой области
    if (preWarm) {
      const parentWidth = travelshopClouds.value?.clientWidth || window.innerWidth
      // От 0% до 100% ширины контейнера (с учетом размера облака)
      const randomPosition = Math.random() * (parentWidth - size)
      cloud.style.right = `${randomPosition}px`

      // Рассчитываем оставшееся расстояние до левого края
      const remainingDistance = parentWidth - randomPosition + size
      // Рассчитываем время анимации пропорционально оставшемуся расстоянию
      const totalDistance = parentWidth + size
      const adjustedSpeed = speed * (remainingDistance / totalDistance)

      cloud.style.transition = `transform ${adjustedSpeed}s linear`
      cloud.style.willChange = 'transform'

      travelshopClouds.value.appendChild(cloud)
      clouds.value.push(cloud)

      requestAnimationFrame(() => {
        cloud.style.transform = `translateX(-${remainingDistance}px)`
      })
    } else {
      // Обычное создание облака (начинает с правого края)
      cloud.style.right = `-${size}px`
      cloud.style.transition = `transform ${speed}s linear`
      cloud.style.willChange = 'transform'

      travelshopClouds.value.appendChild(cloud)
      clouds.value.push(cloud)

      requestAnimationFrame(() => {
        const parentWidth = travelshopClouds.value?.clientWidth || window.innerWidth
        cloud.style.transform = `translateX(-${parentWidth + size * 2}px)`
      })
    }

    // Удаляем облако после завершения анимации
    cloud.addEventListener('transitionend', () => {
      cloud.remove()
      const index = clouds.value.indexOf(cloud)
      if (index > -1) {
        clouds.value.splice(index, 1)
      }
    })
  }

  // Запуск генерации облаков с предварительным прогревом
  const startCloudGeneration = () => {
    // Создаем несколько облаков для предварительного прогрева
    const preWarmCount = 5 // Количество облаков для предварительного прогрева
    for (let i = 0; i < preWarmCount; i++) {
      createCloud(true) // true = предварительный прогрев
    }

    // Затем создаем обычные облака с интервалом
    cloudGenerationInterval.value = window.setInterval(() => {
      const delay = Math.random() * 4000 + 1000
      setTimeout(createCloud, delay) // false = обычное облако
    }, 4000)
  }

  // Остановка генерации
  const stopCloudGeneration = () => {
    if (cloudGenerationInterval.value) {
      clearInterval(cloudGenerationInterval.value)
    }
    clouds.value.forEach(cloud => cloud.remove())
    clouds.value = []
  }

  onMounted(() => {
    startCloudGeneration()
  })

  onUnmounted(() => {
    stopCloudGeneration()
  })
</script>

<template>
  <div class="travelshop">
    <div class="travelshop__intro">
      <div ref="travelshopClouds" class="travelshop__intro-clouds" />
      <img class="travelshop__airport" :src="airportImage" :alt="t('travelshop.title')" />
      <img class="travelshop__aircraft" :src="aircraftImage" alt="aircraft" />
    </div>
    <div class="travelshop__container">
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
              <span
                class="travelshop__feature-icon"
                :class="`travelshop__feature-icon_${feature.icon}`"
              />
              <span>{{ feature.text }}</span>
            </div>
          </div>
        </div>

        <!-- Технологический стек -->
        <div class="travelshop__section">
          <h3 class="travelshop__section-title">
            {{ t('travelshop.tech_stack.title') }}
          </h3>
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
          <div class="travelshop__chart">
            <div
              class="travelshop__chart-item"
              v-for="(item, index) in achievementsGraphs"
              :key="index"
            >
              <CircleChart
                autoPlay
                :value="item.value"
                :size="190"
                :segmentColor="item.color"
                :label="item.text"
              />
            </div>
          </div>
          <div class="travelshop__achievements">
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ t('travelshop.achievements.items.code_reliability') }}</span>
              </div>
            </div>
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ t('travelshop.achievements.items.responsive_design') }}</span>
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
                <LinkArrow class="travelshop__project-arrow" />
              </div>
              <p class="travelshop__project-description">{{ project.description }}</p>
            </a>
          </div>
        </div>
      </div>
      <div class="travelshop__section travelshop__section_images">
        <Button
          v-if="!showSwiper"
          fullWidth
          :text="t('travelshop.view_screenshots')"
          @click="toggleSwiper"
        />
        <div v-if="showSwiper" class="travelshop__ts-slideshow">
          <TravelshopImages
            size="large"
            :text-key="t('travelshop.loading_screenshots')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

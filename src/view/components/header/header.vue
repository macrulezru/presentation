<script setup lang="ts">
  import LangSelector from '@/view/components/lang-selector/lang-selector.vue'
  import '@/view/components/header/header.scss'

  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useNavigationStore } from '@/stores/use-navigation-store.ts'
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'
  import { useResponsive } from '@/view/composables/use-responsive'
  import { useSectionsConfig } from '@/view/composables/use-sections-config'

  const { t } = useI18n()

  const navigationStore = useNavigationStore()
  const { navigateToSection, isProcessingNavigation } = useScrollRouting()
  const { isTablet, isMobile } = useResponsive()

  // Используем реактивную конфигурацию секций
  const { sectionsConfig } = useSectionsConfig()

  const isMobileMenuOpen = ref(false)
  const isProcessingClick = ref(false)

  const currentSection = computed(() => navigationStore.currentSection)

  // Реактивное меню на основе порядка секций
  const menuItems = computed(() => {
    return sectionsConfig.value.map(section => {
      // Создаем маппинг между ID секций и ключами перевода
      const translationKeys: Record<PageSectionsEnum, string> = {
        [PageSectionsEnum.SPLASH]: 'navigation.home',
        [PageSectionsEnum.ABOUT]: 'navigation.about',
        [PageSectionsEnum.EXPERIENCE]: 'navigation.experience',
        [PageSectionsEnum.TRAVELSHOP]: 'navigation.travelshop',
        [PageSectionsEnum.FEATURES]: 'navigation.features',
        [PageSectionsEnum.ARTS]: 'navigation.arts',
        [PageSectionsEnum.REMOTE_WORKPLACE]: 'navigation.workplace',
        [PageSectionsEnum.CONTACTS]: 'navigation.contacts',
      }

      return {
        id: section.id,
        label: t(translationKeys[section.id] || section.id),
      }
    })
  })

  // Проверка размера экрана
  const checkScreenSize = () => {
    if (!isTablet.value && !isMobile.value) {
      isMobileMenuOpen.value = false
    }
  }

  // Обработчик клика по пункту меню
  const handleMenuClick = async (sectionId: string) => {
    if (isProcessingClick.value || isProcessingNavigation.value) {
      return
    }

    isProcessingClick.value = true

    try {
      if (isTablet.value || isMobile.value) {
        isMobileMenuOpen.value = false
      }

      await navigateToSection(sectionId)
    } catch (error) {
      console.error('Menu click error:', error)
    } finally {
      setTimeout(() => {
        isProcessingClick.value = false
      }, 300)
    }
  }

  // Переключение мобильного меню
  const toggleMobileMenu = () => {
    if (isProcessingNavigation.value) return
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  // Закрытие мобильного меню при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
    if (isProcessingNavigation.value) return

    const target = event.target as HTMLElement
    if (
      !target.closest('.header__nav') &&
      !target.closest('.hamburger') &&
      !target.closest('.mobile-menu') &&
      !target.closest('.mobile-menu-overlay')
    ) {
      isMobileMenuOpen.value = false
    }
  }

  // Закрытие меню при нажатии ESC
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false
    }
  }

  const onEditor = () => {
    navigationStore.setShowSectionEditor(true)
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })
</script>

<template>
  <div class="header">
    <div class="header__content">
      <!-- Десктопное меню -->
      <nav v-if="!isTablet && !isMobile" class="header__nav">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="header__nav-item"
          :class="{
            'header__nav-item_home': item.id === PageSectionsEnum.SPLASH,
            'header__nav-item_active': currentSection === item.id,
          }"
          @click="handleMenuClick(item.id)"
          :disabled="isProcessingNavigation"
          :title="isProcessingNavigation ? t('navigation.processing') : ''"
        >
          <template v-if="item.id !== PageSectionsEnum.SPLASH">
            {{ item.label }}
          </template>
        </button>
      </nav>

      <!-- Правая часть: селектор языка и гамбургер -->
      <div class="header__right">
        <!-- Гамбургер-меню для мобильных -->
        <button
          v-if="isTablet || isMobile"
          class="hamburger"
          :class="{
            hamburger_active: isMobileMenuOpen,
          }"
          @click="toggleMobileMenu"
          :disabled="isProcessingNavigation"
          aria-label="Toggle menu"
        >
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </button>
        <div class="header__controls">
          <button class="header__settings" @click="onEditor" />
          <LangSelector />
        </div>
      </div>

      <!-- Мобильное меню (оверлей) -->
      <div
        v-if="(isTablet || isMobile) && isMobileMenuOpen"
        class="mobile-menu-overlay"
        @click="isMobileMenuOpen = false"
      >
        <div class="mobile-menu" @click.stop>
          <button
            v-for="item in menuItems"
            :key="item.id"
            class="mobile-menu__item"
            :class="{
              'mobile-menu__item_active': currentSection === item.id,
            }"
            @click="handleMenuClick(item.id)"
            :disabled="isProcessingNavigation"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

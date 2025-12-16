<script setup lang="ts">
  import LangSelector from '@/view/components/lang-selector/lang-selector.vue'

  import '@/view/components/header/header.scss'

  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useNavigationStore } from '@/stores/use-navigation-store.ts'
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'
  import { useResponsive } from '@/view/composables/use-responsive'

  const { t } = useI18n()

  const navigationStore = useNavigationStore()
  const { navigateToSection, isProcessingNavigation } = useScrollRouting()
  const { isTablet, isMobile } = useResponsive()

  const isMobileMenuOpen = ref(false)
  const isProcessingClick = ref(false)

  const currentSection = computed(() => navigationStore.currentSection)

  const menuItems = computed(() => [
    { id: PageSectionsEnum.SPLASH, label: t('navigation.home') },
    { id: PageSectionsEnum.ABOUT, label: t('navigation.about') },
    { id: PageSectionsEnum.EXPERIENCE, label: t('navigation.experience') },
    { id: PageSectionsEnum.TRAVELSHOP, label: t('navigation.travelshop') },
    { id: PageSectionsEnum.FEATURES, label: t('navigation.features') },
    { id: PageSectionsEnum.ARTS, label: t('navigation.arts') },
    { id: PageSectionsEnum.REMOTE_WORKPLACE, label: t('navigation.workplace') },
    { id: PageSectionsEnum.CONTACTS, label: t('navigation.contacts') },
  ])

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
            'header__nav-item--active': currentSection === item.id,
            'header__nav-item--disabled': isProcessingNavigation,
          }"
          @click="handleMenuClick(item.id)"
          :disabled="isProcessingNavigation"
          :title="isProcessingNavigation ? t('navigation.processing') : ''"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- Правая часть: селектор языка и гамбургер -->
      <div class="header__right">
        <!-- Гамбургер-меню для мобильных -->
        <button
          v-if="isTablet || isMobile"
          class="hamburger"
          :class="{
            'hamburger--active': isMobileMenuOpen,
            'hamburger--disabled': isProcessingNavigation,
          }"
          @click="toggleMobileMenu"
          :disabled="isProcessingNavigation"
          aria-label="Toggle menu"
        >
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </button>
        <LangSelector />
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
              'mobile-menu__item--active': currentSection === item.id,
              'mobile-menu__item--disabled': isProcessingNavigation,
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

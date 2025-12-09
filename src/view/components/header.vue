<script setup lang="ts">
  import LangSelector from '@/view/components/lang-selector.vue'

  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useNavigationStore } from '@/stores/use-navigation-store'
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { PageSectionsEnum } from '@/enums/page-sections.enum'

  const { t } = useI18n()
  const navigationStore = useNavigationStore()

  const { navigateToSection } = useScrollRouting()
  const isMobileMenuOpen = ref(false)
  const isMobile = ref(false)

  const currentSection = computed(() => navigationStore.currentSection)

  const menuItems = computed(() => [
    { id: PageSectionsEnum.SPLASH, label: t('navigation.home') },
    { id: PageSectionsEnum.ABOUT, label: t('navigation.about') },
    { id: PageSectionsEnum.EXPERIENCE, label: t('navigation.experience') },
    { id: PageSectionsEnum.TRAVELSHOP, label: t('navigation.travelshop') },
    { id: PageSectionsEnum.FEATURES, label: t('navigation.features') },
    { id: PageSectionsEnum.REMOTE_WORKPLACE, label: t('navigation.workplace') },
    { id: PageSectionsEnum.CONTACTS, label: t('navigation.contacts') },
  ])

  // Проверка размера экрана
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768
    if (!isMobile.value) {
      isMobileMenuOpen.value = false
    }
  }

  // Обработчик клика по пункту меню
  const handleMenuClick = (sectionId: string) => {
    navigateToSection(sectionId)
    if (isMobile.value) {
      isMobileMenuOpen.value = false
    }
  }

  // Переключение мобильного меню
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  // Закрытие мобильного меню при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
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
      <nav v-if="!isMobile" class="header__nav">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="header__nav-item"
          :class="{
            'header__nav-item--active': currentSection === item.id,
          }"
          @click="handleMenuClick(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- Правая часть: селектор языка и гамбургер -->
      <div class="header__right">
        <!-- Гамбургер-меню для мобильных -->
        <button
          v-if="isMobile"
          class="hamburger"
          :class="{ 'hamburger--active': isMobileMenuOpen }"
          @click="toggleMobileMenu"
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
        v-if="isMobile && isMobileMenuOpen"
        class="mobile-menu-overlay"
        @click="isMobileMenuOpen = false"
      >
        <div class="mobile-menu" @click.stop>
          <button
            v-for="item in menuItems"
            :key="item.id"
            class="mobile-menu__item"
            :class="{ 'mobile-menu__item--active': currentSection === item.id }"
            @click="handleMenuClick(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--color-bg-dark);
    z-index: var(--z-header);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(10px);
    background: rgba(27, 35, 43, 0.95);
  }

  .header__content {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: var(--header-height);
    position: relative;
  }

  .header__logo {
    flex-shrink: 0;
  }

  .header__logo-text {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary), #4facfe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header__nav {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
  }

  .header__nav-item {
    background: none;
    border: none;
    color: var(--color-text-light);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }

  .header__nav-item:not(.header__nav-item--active):hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .header__nav-item--active {
    background-color: #2773b1;
    color: white;
    box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
    transform: translateY(-2px);
  }

  .header__nav-item--active::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
  }

  .header__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: var(--spacing-md);
  }

  .hamburger__line {
    display: block;
    height: 2px;
    width: 100%;
    background-color: var(--color-text-light);
    border-radius: 1px;
    transition: all var(--transition-normal);
    transform-origin: center;
  }

  .hamburger--active .hamburger__line:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .hamburger--active .hamburger__line:nth-child(2) {
    opacity: 0;
  }

  .hamburger--active .hamburger__line:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  .mobile-menu-overlay {
    position: fixed;
    top: var(--header-height-mobile);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: var(--z-modal);
    animation: fadeIn 0.3s ease;
  }

  .mobile-menu {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: var(--color-bg-dark);
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    animation: slideDown 0.3s ease;
    z-index: var(--z-modal);
  }

  .mobile-menu__item {
    background: none;
    border: none;
    color: var(--color-text-light);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    text-align: left;
    font-family: inherit;
  }

  .mobile-menu__item:not(.header__nav-item--active):hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mobile-menu__item--active {
    background-color: #2773b1;
    color: white;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @mixin media-tablet {
    .header__content {
      padding: 0 var(--spacing-sm);
      height: var(--header-height-mobile);
    }

    .header__logo-text {
      font-size: var(--font-size-lg);
    }

    .header__right {
      width: 100%;
      justify-content: space-between;
      gap: var(--spacing-sm);
    }

    .header__nav {
      display: none;
    }
  }

  @mixin media-mobile {
    .header__content {
      padding: 0 var(--spacing-sm);
    }

    .mobile-menu {
      padding: var(--spacing-sm);
    }

    .mobile-menu__item {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-base);
    }
  }

  @mixin media-mobile-small {
    .header__logo-text {
      font-size: var(--font-size-md);
    }

    .mobile-menu__item {
      padding: var(--spacing-sm) var(--spacing-md);
    }
  }

  @media (min-width: 769px) {
    .hamburger {
      display: none;
    }

    .mobile-menu-overlay {
      display: none;
    }
  }
</style>

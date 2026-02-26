<script setup lang="ts">
  import { useResponsive } from 'responsive-media';
  import { computed, onMounted, onUnmounted, ref } from 'vue';

  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts';
  import { useExamplesStore } from '@/stores/use-examples-store.ts';
  import { useNavigationStore } from '@/stores/use-navigation-store.ts';
  import LangSelector from '@/view/components/lang-selector/lang-selector.vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts';
  import { useSectionsConfig } from '@/view/composables/use-sections-config';

  import '@/view/components/header/header.scss';

  const { t } = useI18n();

  const navigationStore = useNavigationStore();
  const examplesStore = useExamplesStore();
  const { navigateToSection, isProcessingNavigation } = useScrollRouting();
  const responsive = useResponsive();

  // Используем реактивную конфигурацию секций
  // Для меню используем явный порядок секций (включая ссылки без компонента)
  const { getSectionOrder } = useSectionsConfig();

  const isMobileMenuOpen = ref(false);
  const isProcessingClick = ref(false);

  const currentSection = computed(() => navigationStore.currentSection);

  // Реактивное меню на основе порядка секций (включая пункты без компонента, например BLOG)
  const menuItems = computed(() => {
    return getSectionOrder().map(id => {
      // Создаем маппинг между ID секций и ключами перевода
      const translationKeys: Record<PageSectionsEnum, string> = {
        [PageSectionsEnum.SPLASH]: 'navigation.home',
        [PageSectionsEnum.ABOUT]: 'navigation.about',
        [PageSectionsEnum.EXPERIENCE]: 'navigation.experience',
        [PageSectionsEnum.TRAVELSHOP]: 'navigation.travelshop',
        [PageSectionsEnum.FEATURES]: 'navigation.features',
        [PageSectionsEnum.STUFF]: 'navigation.stuff',
        [PageSectionsEnum.ARTS]: 'navigation.arts',
        [PageSectionsEnum.REMOTE_WORKPLACE]: 'navigation.workplace',
        [PageSectionsEnum.CONTACTS]: 'navigation.contacts',
        [PageSectionsEnum.BLOG]: 'navigation.blog',
      };

      return {
        id,
        label: t(translationKeys[id] || id),
      };
    });
  });

  // Проверка размера экрана
  const checkScreenSize = () => {
    if (responsive.desktop && isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false;
    }
  };

  // Обработчик клика по пункту меню
  const handleMenuClick = async (sectionId: string) => {
    if (sectionId === PageSectionsEnum.BLOG) {
      window.open('https://blog.macrulez.ru', '_blank');
      return;
    }

    if (isProcessingClick.value || isProcessingNavigation.value) {
      return;
    }

    isProcessingClick.value = true;

    try {
      if (!responsive.desktop) {
        isMobileMenuOpen.value = false;
      }

      await navigateToSection(sectionId);
    } catch (error) {
      console.error('Menu click error:', error);
    } finally {
      setTimeout(() => {
        isProcessingClick.value = false;
      }, 300);
    }
  };

  // Переключение мобильного меню
  const toggleMobileMenu = () => {
    if (isProcessingNavigation.value) return;
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  // Закрытие мобильного меню при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
    if (isProcessingNavigation.value) return;

    const target = event.target as HTMLElement;
    if (
      !target.closest('.header__nav') &&
      !target.closest('.hamburger') &&
      !target.closest('.mobile-menu') &&
      !target.closest('.mobile-menu-overlay')
    ) {
      isMobileMenuOpen.value = false;
    }
  };

  // Закрытие меню при нажатии ESC
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false;
    }
  };

  const onEditor = () => {
    navigationStore.setShowSectionEditor(true);
  };

  // Проверка видимости блока features-list
  function isFeaturesListVisible() {
    const el = document.querySelector('.examples__features-list');
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }

  const triggerVideo = () => {
    if (examplesStore.videoStatus) {
      // Отключаем анимацию
      examplesStore.videoStatus = false;
      // Проверяем видимость блока
      if (isFeaturesListVisible()) {
        examplesStore.setIsShowVideoButton(true);
      } else {
        examplesStore.setIsShowVideoButton(false);
      }
    } else {
      // Включаем анимацию
      examplesStore.videoStatus = true;
      // Кнопка всегда видима
      examplesStore.setIsShowVideoButton(true);
    }
  };

  onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscapeKey);
  });
</script>

<template>
  <div class="header">
    <div class="header__content">
      <nav v-if="responsive.desktop" class="header__nav">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="header__nav-item"
          :class="{
            'header__nav-item_home': item.id === PageSectionsEnum.SPLASH,
            'header__nav-item_active': currentSection === item.id,
          }"
          :disabled="isProcessingNavigation"
          :title="isProcessingNavigation ? t('navigation.processing') : ''"
          @click="handleMenuClick(item.id)"
        >
          <template v-if="item.id !== PageSectionsEnum.SPLASH">
            {{ item.label }}
          </template>
        </button>
      </nav>

      <div class="header__right">
        <button
          v-if="!responsive.desktop"
          class="hamburger"
          :class="{
            hamburger_active: isMobileMenuOpen,
          }"
          :disabled="isProcessingNavigation"
          aria-label="Toggle menu"
          @click="toggleMobileMenu"
        >
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </button>
        <div class="header__controls">
          <button
            v-if="examplesStore.isShowVideoButton"
            class="header__video"
            :class="{ header__video_active: examplesStore.videoStatus }"
            @click="triggerVideo"
          />
          <button class="header__settings" @click="onEditor" />
          <LangSelector />
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="!responsive.desktop"
          class="mobile-menu"
          :class="{ 'mobile-menu_open': isMobileMenuOpen }"
        >
          <button
            v-for="item in menuItems"
            :key="item.id"
            class="mobile-menu__item"
            :class="{
              'mobile-menu__item_active': currentSection === item.id,
            }"
            :disabled="isProcessingNavigation"
            @click="handleMenuClick(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </Teleport>
    </div>
  </div>
</template>

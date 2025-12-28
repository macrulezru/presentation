<script setup lang="ts">
  import '@/view/ui/ui-tabs/ui-tabs.scss';

  import {
    ref,
    provide,
    type Ref,
    onMounted,
    computed,
    type ComponentPublicInstance,
  } from 'vue';

  import { TABS_ADD_KEY, TABS_ACTIVE_HASH_KEY, TABS_UPDATE_KEY } from './tokens';

  import type { Tab } from './types';

  const emit = defineEmits<{
    mounted: [];
  }>();

  const activeTabHash = ref('');
  const tabs: Ref<Array<Tab>> = ref([]);

  const setActiveTab = (tab: Tab) => {
    activeTabHash.value = tab.hash;
  };

  const preselectTab = (id: string) => {
    const foundTab = tabs.value.find(tab => tab.id === id);
    if (foundTab) {
      setActiveTab(foundTab);
    }
  };

  provide(TABS_ADD_KEY, (tab: Tab) => {
    const count = tabs.value.push(tab);
    if (count === 1) {
      activeTabHash.value = tab.hash;
    }
  });

  provide(TABS_UPDATE_KEY, (oldHash: string, updatedTab: Tab) => {
    const index = tabs.value.findIndex(tab => tab.hash === oldHash);
    if (index !== -1) {
      tabs.value[index] = updatedTab;

      if (activeTabHash.value === oldHash) {
        activeTabHash.value = updatedTab.hash;
      }
    }
  });

  provide(TABS_ACTIVE_HASH_KEY, activeTabHash);

  const activeIndex = computed(() =>
    tabs.value.findIndex(tab => tab.hash === activeTabHash.value),
  );

  const tabRefs = ref<HTMLElement[]>([]);
  const setTabRef = (el: Element | ComponentPublicInstance | null, index: number) => {
    if (el && '$el' in (el as any)) {
      tabRefs.value[index] = (el as any).$el as HTMLElement;
    } else {
      tabRefs.value[index] = el as HTMLElement;
    }
  };

  const focusTabAt = (index: number) => {
    const target = tabRefs.value[index];
    target?.focus();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!tabs.value.length) return;

    const current = activeIndex.value === -1 ? 0 : activeIndex.value;
    let nextIndex = current;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (current + 1) % tabs.value.length;
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (current - 1 + tabs.value.length) % tabs.value.length;
        event.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        nextIndex = tabs.value.length - 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    const tab = tabs.value[nextIndex];
    if (tab) {
      setActiveTab(tab);
      focusTabAt(nextIndex);
    }
  };

  defineExpose({ preselectTab });

  onMounted(() => {
    emit('mounted');
  });
</script>

<template>
  <div class="ui-tabs">
    <div class="ui-tabs__wrapper">
      <div class="ui-tabs__navbar" role="tablist" @keydown="handleKeydown">
        <div
          v-for="(tab, index) in tabs"
          :id="tab.tabId"
          :key="tab.hash"
          :ref="el => setTabRef(el, index)"
          class="ui-tabs__navbar-item"
          :class="{
            'ui-tabs__navbar-item_active': tab.hash === activeTabHash,
          }"
          role="tab"
          :aria-selected="tab.hash === activeTabHash"
          :tabindex="tab.hash === activeTabHash ? 0 : -1"
          :aria-controls="tab.panelId"
          @click="setActiveTab(tab)"
        >
          {{ tab.title }}
        </div>
      </div>
    </div>
    <div class="ui-tabs__content">
      <slot />
    </div>
  </div>
</template>

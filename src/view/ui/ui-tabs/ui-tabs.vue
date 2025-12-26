<script setup lang="ts">
  import '@/view/ui/ui-tabs/ui-tabs.scss';

  import { ref, provide, type Ref, onMounted } from 'vue';
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

  provide('tshTabsAddTab', (tab: Tab) => {
    const count = tabs.value.push(tab);
    if (count === 1) {
      activeTabHash.value = tab.hash;
    }
  });

  provide('tshTabsUpdateTab', (oldHash: string, updatedTab: Tab) => {
    const index = tabs.value.findIndex(tab => tab.hash === oldHash);
    if (index !== -1) {
      tabs.value[index] = updatedTab;

      if (activeTabHash.value === oldHash) {
        activeTabHash.value = updatedTab.hash;
      }
    }
  });

  provide('tshTabsActiveHash', activeTabHash);

  defineExpose({ preselectTab });

  onMounted(() => {
    emit('mounted');
  });
</script>

<template>
  <div class="ui-tabs">
    <div class="ui-tabs__wrapper">
      <div class="ui-tabs__navbar">
        <div
          v-for="tab in tabs"
          :key="tab.hash"
          class="ui-tabs__navbar-item"
          :class="{
            'ui-tabs__navbar-item_active': tab.hash === activeTabHash,
          }"
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

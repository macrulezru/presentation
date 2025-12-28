<script setup lang="ts">
  import '@/view/ui/ui-tabs/parts/ui-tab/ui-tab.scss';

  import { onBeforeMount, watch, inject, ref, type Ref, computed } from 'vue';

  import { TABS_ACTIVE_HASH_KEY, TABS_ADD_KEY, TABS_UPDATE_KEY } from '../../tokens';

  import type { Props } from './types';

  const props = defineProps<Props>();

  const tshTabsAddTab = inject<
    | ((tab: {
        title: string;
        id?: string;
        hash: string;
        tabId: string;
        panelId: string;
      }) => void)
    | undefined
  >(TABS_ADD_KEY);
  const tshTabsUpdateTab = inject<
    | ((
        oldHash: string,
        updatedTab: {
          title: string;
          id?: string;
          hash: string;
          tabId: string;
          panelId: string;
        },
      ) => void)
    | undefined
  >(TABS_UPDATE_KEY);
  const tshTabsActiveHash = inject<Ref<string> | undefined>(TABS_ACTIVE_HASH_KEY);

  const hash = computed(() => {
    return `#${props.title.toLowerCase().replace(/ /g, '-')}`;
  });

  const baseId = computed(() => (props.id ? props.id : hash.value.replace('#', '')));
  const tabId = computed(() => `tab-${baseId.value}`);
  const panelId = computed(() => `panel-${baseId.value}`);

  const isActive = ref(false);

  const initialHash = ref('');

  watch(
    () => tshTabsActiveHash?.value,
    () => {
      isActive.value = tshTabsActiveHash?.value === hash.value;
    },
  );

  onBeforeMount(() => {
    initialHash.value = hash.value;

    tshTabsAddTab?.({
      title: props.title,
      id: props.id,
      hash: hash.value,
      tabId: tabId.value,
      panelId: panelId.value,
    });
  });

  watch(
    () => props.title,
    (newTitle, oldTitle) => {
      const oldHash = `#${oldTitle.toLowerCase().replace(/ /g, '-')}`;
      const newHash = hash.value;

      tshTabsUpdateTab?.(oldHash, {
        title: newTitle,
        id: props.id,
        hash: newHash,
        tabId: tabId.value,
        panelId: panelId.value,
      });
    },
  );
</script>

<template>
  <div
    v-if="isActive"
    :id="panelId"
    class="ui-tab"
    role="tabpanel"
    :aria-labelledby="tabId"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
  import RequestInfoColumn from '@/view/components/rest-api/parts/request-info-column/request-info-column.vue';
  import RawResponseColumn from '@/view/components/rest-api/parts/raw-response-column/raw-response-column.vue';
  import EmptyState from '@/view/components/rest-api/parts/empty-state/empty-state.vue';
  import Button from '@/view/ui/ui-button/ui-button.vue';

  import '@/view/components/rest-api/parts/api-demo-block/api-demo-block.scss';

  import { computed, useSlots } from 'vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import { useResponsive } from '@/view/composables/use-responsive';
  import type { Props, Emits } from './types';

  const { t } = useI18n();

  const props = defineProps<Props>();

  const emit = defineEmits<Emits>();

  const slots = useSlots();
  const { isMobile } = useResponsive();

  const hasData = computed(() => props.rawResponse || props.error);

  const isHasApiDescription = computed(() => {
    return slots['api-description'];
  });
</script>

<template>
  <div class="api-demo-block">
    <div class="api-demo-block__controls">
      <Button
        :small="!isMobile"
        :micro="isMobile"
        :fullWidth="isMobile"
        :text="t('rest-api.getRandom')"
        :disabled="loading"
        @click="emit('fetch')"
      />
      <Button
        :small="!isMobile"
        :micro="isMobile"
        :fullWidth="isMobile"
        reset
        :text="t('rest-api.clear')"
        :disabled="!hasData"
        @click="emit('clear')"
      />
    </div>

    <div v-if="error" class="api-demo-block__error-message">
      <h3>{{ t('rest-api.errorTitle') }}</h3>
      <pre>{{ error }}</pre>
    </div>

    <div class="api-demo-block__response-columns">
      <RequestInfoColumn :api-info="apiInfo" :loading="loading" :error="error" />

      <RawResponseColumn :loading="loading" :error="error" :raw-response="rawResponse" />

      <div class="api-demo-block__column api-demo-block__formatted-data">
        <h3 class="api-demo-block__column-title">{{ t('rest-api.formattedData') }}</h3>
        <div class="api-demo-block__formatted-card">
          <slot name="formatted-data">
            <EmptyState :loading="loading" />
          </slot>
        </div>
      </div>
    </div>
    <div v-if="isHasApiDescription" class="api-demo-block__api-description">
      <slot name="api-description" />
    </div>
  </div>
</template>

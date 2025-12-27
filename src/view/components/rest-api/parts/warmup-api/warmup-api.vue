<script setup lang="ts">
  import '@/view/components/rest-api/parts/warmup-api/warmup-api.scss';

  import { computed, onMounted, onUnmounted, ref } from 'vue';

  import { healthCommand } from '@/core/commands/health.command';
  import { useWarmupStore } from '@/stores/use-warmup-store';
  import { useI18n } from '@/view/composables/use-i18n';

  const { t } = useI18n();

  const { setWarmupStatus } = useWarmupStore();

  const CHANGE_LOADING_MESSAGE_INTERVAL = 8000;

  const currentIndex = ref<number>(0);
  const isTransitioning = ref<boolean>(false);
  const visibleMessageIndex = ref<number>(0);

  let intervalId: number | NodeJS.Timeout | null = null;
  let messageChangeTimer: number | NodeJS.Timeout | null = null;

  const waitingMessages = computed(() => [
    t('rest-api.warmup.status.serverWaking'),
    t('rest-api.warmup.status.waitALittle'),
    t('rest-api.warmup.status.almostReady'),
    t('rest-api.warmup.status.startingServices'),
  ]);

  const visibleMessage = computed(() => {
    return waitingMessages.value[visibleMessageIndex.value];
  });

  const checkWarmupApi = async () => {
    try {
      setWarmupStatus(false);
      const command = healthCommand.getHealth();
      const result = await command.execute();
      console.log(result);
      if (result.status === 'OK') {
        setWarmupStatus(true);
      } else {
        checkWarmupApi();
      }
    } catch {
      checkWarmupApi();
    }
  };

  const changeMessage = () => {
    isTransitioning.value = true;

    messageChangeTimer = setTimeout(() => {
      currentIndex.value = (currentIndex.value + 1) % waitingMessages.value.length;
      visibleMessageIndex.value = currentIndex.value;

      setTimeout(() => {
        isTransitioning.value = false;
      }, 50);
    }, 500);
  };

  onMounted(() => {
    checkWarmupApi();

    visibleMessageIndex.value = currentIndex.value;

    intervalId = setInterval(() => {
      changeMessage();
    }, CHANGE_LOADING_MESSAGE_INTERVAL);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
    if (messageChangeTimer) clearTimeout(messageChangeTimer);
  });
</script>

<template>
  <div class="warmup-api">
    <div class="warmup-api__title">{{ t('rest-api.warmup.title') }}</div>
    <div class="warmup-api__spinner"></div>

    <div class="warmup-api__status-container">
      <div
        class="warmup-api__status"
        :class="{
          'warmup-api__status--active': !isTransitioning,
          'warmup-api__status--exiting': isTransitioning,
        }"
      >
        {{ visibleMessage }}
      </div>
    </div>

    <div class="warmup-api__description">{{ t('rest-api.warmup.description') }}</div>
  </div>
</template>

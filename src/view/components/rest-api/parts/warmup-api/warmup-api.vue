<script setup lang="ts">
  import '@/view/components/rest-api/parts/warmup-api/warmup-api.scss'

  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { healthCommand } from '@/core/commands/health.command'
  import { useWarmupStore } from '@/stores/use-warmup-store'
  import { useI18n } from '@/view/composables/use-i18n'

  const { t } = useI18n()

  const { setWarmupStatus } = useWarmupStore()

  const currentIndex = ref<number>(0)
  let intervalId: number | NodeJS.Timeout

  const waitingMessages = computed(() => [
    t('rest-api.warmup.status.serverWaking'),
    t('rest-api.warmup.status.waitALittle'),
    t('rest-api.warmup.status.almostReady'),
    t('rest-api.warmup.status.startingServices'),
  ])

  const statusMessage = computed(() => {
    return waitingMessages.value[currentIndex.value]
  })

  const checkWarmupApi = async () => {
    try {
      setWarmupStatus(false)
      const command = healthCommand.getHealth()
      const result = await command.execute()
      console.log(result)
      if (result.status === 'OK') {
        setWarmupStatus(true)
      } else {
        checkWarmupApi()
      }
    } catch (error: any) {
      checkWarmupApi()
    }
  }

  onMounted(() => {
    checkWarmupApi()
    intervalId = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % waitingMessages.value.length
    }, 3000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
</script>

<template>
  <div class="warmup-api">
    <div class="warmup-api__title">{{ t('rest-api.warmup.title') }}</div>
    <div class="warmup-api__spinner"></div>
    <div class="warmup-api__status">{{ statusMessage }}</div>
    <div class="warmup-api__description">{{ t('rest-api.warmup.description') }}</div>
  </div>
</template>

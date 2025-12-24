<script setup lang="ts">
  import '@/view/components/rest-api/parts/warmup-api/warmup-api.scss'

  import { onMounted } from 'vue'
  import { healthCommand } from '@/core/commands/health.command'
  import { useWarmupStore } from '@/stores/use-warmup-store'

  const { t } = useI18n()

  const { setWarmupStatus } = useWarmupStore()

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
  })
</script>

<template>
  <div class="warmup-api">
    <div class="warmup-api__title">{{ t('rest-api.warmup.title') }}</div>
    <div class="warmup-api__spinner"></div>
    <div class="warmup-api__description">{{ t('rest-api.warmup.description') }}</div>
  </div>
</template>

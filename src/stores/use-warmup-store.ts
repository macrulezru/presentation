import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useWarmupStore = defineStore('warmup', () => {
  const warmupStatus = ref<boolean>(false)

  const setWarmupStatus = (status: boolean) => {
    warmupStatus.value = status
  }

  return {
    warmupStatus,
    setWarmupStatus,
  }
})

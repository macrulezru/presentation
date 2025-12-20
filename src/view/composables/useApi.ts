// @/composables/useApi.ts
import { ref, computed } from 'vue'
import type { ApiResponse, ApiError } from '@/core/config'

export function useApi<T>() {
  // Состояние
  const data = ref<T | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<ApiError | null>(null)
  const rawResponse = ref<ApiResponse<T> | null>(null)

  // Статистика
  const requestCount = ref(0)
  const successCount = ref(0)
  const errorCount = ref(0)

  // Компьютед свойства
  const hasData = computed(() => data.value !== null)
  const hasError = computed(() => error.value !== null)
  const isEmpty = computed(
    () => hasData.value && (Array.isArray(data.value) ? data.value.length === 0 : false),
  )

  /**
   * Выполнение запроса
   */
  const execute = async (
    requestFn: () => Promise<ApiResponse<T>>,
    options: {
      onSuccess?: (data: T) => void
      onError?: (error: ApiError) => void
      resetBefore?: boolean
    } = {},
  ) => {
    const { onSuccess, onError, resetBefore = true } = options

    // Сброс состояния перед новым запросом
    if (resetBefore) {
      reset()
    }

    loading.value = true
    requestCount.value++

    try {
      const response = await requestFn()

      data.value = response.data
      rawResponse.value = response
      error.value = null
      successCount.value++

      onSuccess?.(response.data)
      return response
    } catch (err: any) {
      const apiError = err as ApiError
      error.value = apiError
      data.value = null
      rawResponse.value = null
      errorCount.value++

      onError?.(apiError)
      throw apiError
    } finally {
      loading.value = false
    }
  }

  /**
   * Удобный метод для GET запросов
   */
  const fetch = async (
    fetcher: { get: <T>(endpoint: string) => Promise<ApiResponse<T>> },
    endpoint: string,
    options?: Parameters<typeof execute>[1],
  ) => {
    return execute(() => fetcher.get<T>(endpoint), options)
  }

  /**
   * Удобный метод для POST запросов
   */
  const post = async (
    fetcher: { post: <T>(endpoint: string, data?: any) => Promise<ApiResponse<T>> },
    endpoint: string,
    payload?: any,
    options?: Parameters<typeof execute>[1],
  ) => {
    return execute(() => fetcher.post<T>(endpoint, payload), options)
  }

  /**
   * Сброс состояния
   */
  const reset = () => {
    data.value = null
    error.value = null
    rawResponse.value = null
  }

  /**
   * Ручная установка данных (например, из кэша)
   */
  const setData = (newData: T) => {
    data.value = newData
    error.value = null
    loading.value = false
  }

  return {
    // Состояние
    data,
    loading,
    error,
    rawResponse,

    // Статистика
    requestCount,
    successCount,
    errorCount,

    // Компьютед
    hasData,
    hasError,
    isEmpty,

    // Методы
    execute,
    fetch,
    post,
    reset,
    setData,
  }
}

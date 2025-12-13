<script setup lang="ts">
  import '@/view/ui/ui-select/ui-select.scss'
  import { ref, computed, onMounted, onUnmounted } from 'vue'

  interface SelectOption {
    /** Значение опции */
    value: string
    /** Отображаемое имя опции */
    name: string
  }

  interface Props {
    /** Текущее выбранное значение (v-model) */
    modelValue?: SelectOption

    /** Массив доступных опций */
    options: SelectOption[]

    /** Текст плейсхолдера */
    placeholder?: string
  }

  interface Emits {
    /** Событие обновления значения (v-model) */
    (e: 'update:modelValue', value: SelectOption): void

    /** Событие изменения значения */
    (e: 'change', value: SelectOption): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    placeholder: 'Select...',
  })

  const emit = defineEmits<Emits>()

  const isOpen = ref(false)

  /**
   * Текущая выбранная опция
   */
  const selectedOption = computed(() =>
    props.options.find(option => option.value === props.modelValue?.value),
  )

  /**
   * Переключает состояние выпадающего списка
   */
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }

  /**
   * Закрывает выпадающий список
   */
  const closeDropdown = () => {
    isOpen.value = false
  }

  /**
   * Выбирает опцию и эмитит события
   * @param option - выбранная опция
   */
  const selectOption = (option: SelectOption) => {
    emit('update:modelValue', option)
    emit('change', option)
    closeDropdown()
  }

  /**
   * Обработчик клика вне компонента
   */
  const clickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.dlv-select')) {
      closeDropdown()
    }
  }

  onMounted(() => {
    document.addEventListener('click', clickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', clickOutside)
  })
</script>

<template>
  <div class="dlv-select" :class="{ 'dlv-select--open': isOpen }">
    <div
      class="dlv-select__trigger"
      @click="toggleDropdown"
      @blur="closeDropdown"
      tabindex="0"
      role="button"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
    >
      <span class="dlv-select__selected">
        {{ selectedOption?.name || placeholder }}
      </span>
      <slot name="arrow">
        <div
          class="dlv-select__arrow"
          :class="{ 'dlv-select__arrow--open': isOpen }"
          aria-hidden="true"
        >
          ▼
        </div>
      </slot>
    </div>

    <div v-if="isOpen" class="dlv-select__dropdown" role="listbox">
      <div
        v-for="option in options"
        :key="option.value"
        class="dlv-select__option"
        :class="{ 'dlv-select__option--selected': option.value === modelValue?.value }"
        @click="selectOption(option)"
        @mousedown.prevent
        role="option"
        :aria-selected="option.value === modelValue?.value"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import '@/view/ui/ui-select/ui-select.scss'

  interface SelectOption {
    value: string
    name: string
  }

  interface Props {
    modelValue?: SelectOption
    options: SelectOption[]
    placeholder?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: SelectOption): void
    (e: 'change', value: SelectOption): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    placeholder: 'Select...',
  })

  const emit = defineEmits<Emits>()

  const isOpen = ref(false)

  const selectedOption = computed(() =>
    props.options.find(option => option.value === props.modelValue?.value),
  )

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }

  const closeDropdown = () => {
    isOpen.value = false
  }

  const selectOption = (option: SelectOption) => {
    emit('update:modelValue', option)
    emit('change', option)
    closeDropdown()
  }

  // Закрываем dropdown при клике вне компонента
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
    >
      <span class="dlv-select__selected">
        {{ selectedOption?.name || placeholder }}
      </span>
      <slot name="arrow">
        <div class="dlv-select__arrow" :class="{ 'dlv-select__arrow--open': isOpen }">
          ▼
        </div>
      </slot>
    </div>

    <div v-if="isOpen" class="dlv-select__dropdown">
      <div
        v-for="option in options"
        :key="option.value"
        class="dlv-select__option"
        :class="{ 'dlv-select__option--selected': option.value === modelValue?.value }"
        @click="selectOption(option)"
        @mousedown.prevent
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

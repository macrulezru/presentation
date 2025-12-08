<script setup lang="ts">
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

<style scoped>
  .dlv-select {
    position: relative;
    display: inline-block;
    min-width: 120px;
  }

  .dlv-select__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: var(--font-size-sm);
    line-height: 1.5;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    user-select: none;
    color: white;
    backdrop-filter: blur(10px);
  }

  .dlv-select__trigger:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .dlv-select__trigger:focus {
    background: rgba(255, 255, 255, 0.2);
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }

  .dlv-select__selected {
    color: white;
    font-weight: 500;
  }

  .dlv-select__arrow {
    color: rgba(255, 255, 255, 0.7);
    font-size: 10px;
    transition: transform 0.3s ease;
    margin-left: 8px;
  }

  .dlv-select__arrow--open {
    transform: rotate(180deg);
  }

  .dlv-select__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .dlv-select__option {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #2c3e50;
    font-weight: 500;
    border-bottom: 1px solid #f8f9fa;
  }

  .dlv-select__option:hover {
    background-color: #f8f9fa;
    color: #3498db;
  }

  .dlv-select__option--selected {
    background-color: #3498db;
    color: white;
  }

  .dlv-select__option--selected:hover {
    background-color: #2980b9;
    color: white;
  }

  .dlv-select__option:last-child {
    border-bottom: none;
  }

  @mixin media-tablet {
    .dlv-select {
      min-width: 100px;
    }

    .dlv-select__trigger {
      padding: 6px 12px;
      font-size: 13px;
    }

    .dlv-select__option {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  @mixin media-mobile {
    .dlv-select {
      min-width: 90px;
    }

    .dlv-select__trigger {
      padding: 5px 10px;
      font-size: 12px;
    }
  }
</style>

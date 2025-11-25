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
      <div class="dlv-select__arrow" :class="{ 'dlv-select__arrow--open': isOpen }">
        ▼
      </div>
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

<style scoped>
  .dlv-select {
    position: relative;
    display: inline-block;
    min-width: 140px;
  }

  .dlv-select__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    line-height: 1.5;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
    user-select: none;
  }

  .dlv-select__trigger:hover {
    border-color: #c0c4cc;
  }

  .dlv-select__trigger:focus {
    border-color: #409eff;
  }

  .dlv-select__selected {
    color: #606266;
  }

  .dlv-select__arrow {
    color: #c0c4cc;
    font-size: 12px;
    transition: transform 0.2s;
  }

  .dlv-select__arrow--open {
    transform: rotate(180deg);
  }

  .dlv-select__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .dlv-select__option {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dlv-select__option:hover {
    background-color: #f5f7fa;
  }

  .dlv-select__option--selected {
    background-color: #f0f9ff;
    color: #409eff;
  }
</style>

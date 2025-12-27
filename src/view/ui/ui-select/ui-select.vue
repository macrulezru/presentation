<script setup lang="ts">
  import '@/view/ui/ui-select/ui-select.scss';

  import { ref, computed, onMounted, onUnmounted } from 'vue';

  import type { SelectOption, Props, Emits } from './types';

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    placeholder: 'Select...',
  });

  const emit = defineEmits<Emits>();

  const isOpen = ref(false);

  /**
   * Текущая выбранная опция
   */
  const selectedOption = computed(() =>
    props.options.find(option => option.value === props.modelValue?.value),
  );

  /**
   * Переключает состояние выпадающего списка
   */
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  /**
   * Закрывает выпадающий список
   */
  const closeDropdown = () => {
    isOpen.value = false;
  };

  /**
   * Выбирает опцию и эмитит события
   * @param option - выбранная опция
   */
  const selectOption = (option: SelectOption) => {
    emit('update:modelValue', option);
    emit('change', option);
    closeDropdown();
  };

  /**
   * Обработчик клика вне компонента
   */
  const clickOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.ui-select')) {
      closeDropdown();
    }
  };

  onMounted(() => {
    document.addEventListener('click', clickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', clickOutside);
  });
</script>

<template>
  <div class="ui-select" :class="{ 'ui-select--open': isOpen }">
    <div
      class="ui-select__trigger"
      tabindex="0"
      role="button"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      @click="toggleDropdown"
      @blur="closeDropdown"
    >
      <span class="ui-select__selected">
        {{ selectedOption?.name || placeholder }}
      </span>
      <slot name="arrow">
        <div
          class="ui-select__arrow"
          :class="{ 'ui-select__arrow--open': isOpen }"
          aria-hidden="true"
        >
          ▼
        </div>
      </slot>
    </div>

    <div v-if="isOpen" class="ui-select__dropdown" role="listbox">
      <div
        v-for="option in options"
        :key="option.value"
        class="ui-select__option"
        :class="{ 'ui-select__option--selected': option.value === modelValue?.value }"
        role="option"
        :aria-selected="option.value === modelValue?.value"
        @click="selectOption(option)"
        @mousedown.prevent
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

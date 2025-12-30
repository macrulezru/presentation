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
  const highlightedIndex = ref(-1);

  /**
   * Текущая выбранная опция
   */
  const selectedOption = computed(() =>
    props.options.find(option => option.value === props.modelValue?.value),
  );

  /**
   * Переключает состояние выпадающего списка
   */
  const selectedIndex = computed(() =>
    props.options.findIndex(option => option.value === props.modelValue?.value),
  );

  const setHighlighted = (index: number) => {
    if (index < 0 || index >= props.options.length) {
      highlightedIndex.value = -1;
    } else {
      highlightedIndex.value = index;
    }
  };

  const openDropdown = () => {
    isOpen.value = true;
    setHighlighted(selectedIndex.value >= 0 ? selectedIndex.value : 0);
  };

  const toggleDropdown = () => {
    if (isOpen.value) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  /**
   * Закрывает выпадающий список
   */
  const closeDropdown = () => {
    isOpen.value = false;
    highlightedIndex.value = -1;
    // Снимаем фокус с триггера после выбора
    setTimeout(() => {
      const el = document.activeElement as HTMLElement;
      if (el && el.classList.contains('ui-select__trigger')) {
        el.blur();
      }
    }, 0);
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

  const getOptionId = (index: number) => `ui-select-option-${index}`;

  const onTriggerKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          setHighlighted(
            highlightedIndex.value === -1
              ? 0
              : (highlightedIndex.value + 1) % props.options.length,
          );
        }
        break;
      case 'ArrowUp':
      case 'Up':
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          setHighlighted(
            highlightedIndex.value <= 0
              ? props.options.length - 1
              : highlightedIndex.value - 1,
          );
        }
        break;
      case 'Enter':
      case ' ': {
        if (!isOpen.value) {
          event.preventDefault();
          openDropdown();
        } else if (
          highlightedIndex.value >= 0 &&
          highlightedIndex.value < props.options.length
        ) {
          event.preventDefault();
          const option = props.options[highlightedIndex.value];
          if (option) selectOption(option);
        }
        break;
      }
      case 'Escape':
        closeDropdown();
        break;
      default:
        break;
    }
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
      @keydown="onTriggerKeydown"
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 6.5L8 10L11.5 6.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </slot>
    </div>

    <transition name="ui-select-dropdown-fade">
      <div
        v-if="isOpen"
        class="ui-select__dropdown"
        role="listbox"
        :aria-activedescendant="
          highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined
        "
        tabindex="-1"
      >
        <div
          v-for="(option, index) in options"
          :id="getOptionId(index)"
          :key="option.value"
          class="ui-select__option"
          :class="{ 'ui-select__option--selected': option.value === modelValue?.value }"
          role="option"
          :aria-selected="option.value === modelValue?.value"
          @click="selectOption(option)"
          @mouseenter="setHighlighted(index)"
          @mousedown.prevent
        >
          {{ option.name }}
        </div>
      </div>
    </transition>
  </div>
</template>

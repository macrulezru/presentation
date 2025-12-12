<script setup lang="ts">
  import '@/view/ui/ui-button/ui-button.scss'

  interface Props {
    text: string
    fullWidth?: boolean
    small?: boolean
    disabled?: boolean
    gray?: boolean
  }

  const props = defineProps<Props>()

  const classes = computed(() => {
    return {
      'ui-button_full-width': props.fullWidth,
      'ui-button_small': props.small,
      'ui-button_disabled': props.disabled,
      'ui-button_gray': props.gray,
    }
  })
</script>

<template>
  <button class="ui-button" :class="classes">{{ props.text }}</button>
</template>

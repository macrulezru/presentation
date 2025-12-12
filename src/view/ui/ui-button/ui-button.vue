<script setup lang="ts">
  import '@/view/ui/ui-button/ui-button.scss'

  interface Props {
    text: string
    fullWidth?: boolean
    small?: boolean
  }

  const props = defineProps<Props>()

  const classes = computed(() => {
    return {
      'ui-button_full-width': props.fullWidth,
      'ui-button_small': props.small,
    }
  })
</script>

<template>
  <button class="ui-button" :class="classes">{{ props.text }}</button>
</template>

<script setup lang="ts">
  import { onBeforeMount, watch, inject, ref, type Ref } from 'vue'

  import '@/view/ui/ui-tabs/parts/ui-tab/ui-tab.scss'

  interface Props {
    title: string
    id?: string
  }

  const props = defineProps<Props>()

  const tshTabsAddTab: any = inject('tshTabsAddTab')
  const tshTabsActiveHash = inject('tshTabsActiveHash')

  const hash = ref('')
  const isActive = ref(false)

  watch(
    () => {
      return (tshTabsActiveHash as Ref).value
    },
    () => {
      isActive.value = (tshTabsActiveHash as Ref).value === hash.value
    },
  )

  onBeforeMount(() => {
    hash.value = `#${props.title.toLowerCase().replace(/ /g, '-')}`

    tshTabsAddTab({
      title: props.title,
      id: props.id,
      hash: hash.value,
    })
  })
</script>

<template>
  <div v-if="isActive" class="ui-tab">
    <slot />
  </div>
</template>

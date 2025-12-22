<script setup lang="ts">
  import { onBeforeMount, watch, inject, ref, type Ref, computed } from 'vue'
  import '@/view/ui/ui-tabs/parts/ui-tab/ui-tab.scss'

  interface Props {
    title: string
    id?: string
  }

  const props = defineProps<Props>()

  const tshTabsAddTab: any = inject('tshTabsAddTab')
  const tshTabsUpdateTab: any = inject('tshTabsUpdateTab')
  const tshTabsActiveHash = inject('tshTabsActiveHash')

  const hash = computed(() => {
    return `#${props.title.toLowerCase().replace(/ /g, '-')}`
  })

  const isActive = ref(false)

  const initialHash = ref('')

  watch(
    () => {
      return (tshTabsActiveHash as Ref).value
    },
    () => {
      isActive.value = (tshTabsActiveHash as Ref).value === hash.value
    },
  )

  onBeforeMount(() => {
    initialHash.value = hash.value

    tshTabsAddTab({
      title: props.title,
      id: props.id,
      hash: hash.value,
    })
  })

  watch(
    () => props.title,
    (newTitle, oldTitle) => {
      const oldHash = `#${oldTitle.toLowerCase().replace(/ /g, '-')}`
      const newHash = hash.value

      if (tshTabsUpdateTab) {
        tshTabsUpdateTab(oldHash, {
          title: newTitle,
          id: props.id,
          hash: newHash,
        })
      }
    },
  )
</script>

<template>
  <div v-if="isActive" class="ui-tab">
    <slot />
  </div>
</template>

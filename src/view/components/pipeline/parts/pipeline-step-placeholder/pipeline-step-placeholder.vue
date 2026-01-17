<script setup lang="ts">
  import './pipeline-step-placeholder.scss';

  interface Block {
    height: number;
  }

  interface Props {
    blocks: Block[];
  }

  const props = defineProps<Props>();
</script>

<template>
  <div class="pipeline-step-placeholder">
    <div
      v-for="(block, index) in props.blocks"
      :key="index"
      class="pipeline-step-placeholder__item"
      :style="{ height: block.height + 'px' }"
    />
  </div>
</template>

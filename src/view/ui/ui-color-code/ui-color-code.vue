<script setup lang="ts">
  import Prism from 'prismjs';
  import { computed } from 'vue';

  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-typescript';
  import 'prismjs/components/prism-json';
  import 'prismjs/themes/prism.css';
  import './ui-color-code.scss';

  type Language = 'json' | 'js' | 'typescript';
  interface Props {
    code: unknown;
    indent?: number;
    language?: Language;
  }

  const props = defineProps<Props>();

  const highlighted = computed(() => {
    const lang = props.language ?? 'json';
    const code = String(props.code);
    if (lang === 'json') {
      let json: string;
      try {
        json = JSON.stringify(props.code, null, props.indent ?? 2);
      } catch {
        json = code;
      }
      return Prism.highlight(json, Prism.languages.json, 'json');
    } else if (lang === 'js') {
      return Prism.highlight(code, Prism.languages.javascript, 'javascript');
    } else if (lang === 'typescript') {
      return Prism.highlight(code, Prism.languages.typescript, 'typescript');
    } else {
      return Prism.util.encode(code);
    }
  });
</script>

<template>
  <pre class="ui-color-code" v-html="highlighted" />
</template>

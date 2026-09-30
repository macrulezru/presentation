<script setup lang="ts">
  import './JsonCodeMirror.scss';

  import { json } from '@codemirror/lang-json';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { EditorView, basicSetup } from 'codemirror';
  import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';

  const props = defineProps<{
    value: unknown;
    readonly?: boolean;
  }>();

  const container = ref<HTMLElement | null>(null);
  const editor = shallowRef<EditorView | null>(null);

  const getExtensions = () => {
    const base = [
      basicSetup,
      json(),
      oneDark,
      EditorView.theme({
        '&': {
          height: 'auto',
          minHeight: '500px',
          with: 'auto',
          fontSize: '13px',
        },
        '&.cm-focused': { outline: 'none' },
        '.cm-content': { padding: '10px 0' },
        '.cm-line': { padding: '0 10px' },
      }),
    ];
    if (props.readonly) {
      base.push(EditorState.readOnly.of(true));
    }
    return base;
  };

  const updateContent = (newVal: unknown) => {
    if (!editor.value) return;
    const newJson = JSON.stringify(newVal, null, 2);
    const current = editor.value.state.doc.toString();
    if (newJson !== current) {
      editor.value.dispatch({
        changes: { from: 0, to: editor.value.state.doc.length, insert: newJson },
      });
    }
  };

  onMounted(() => {
    if (!container.value) return;
    const state = EditorState.create({
      doc: JSON.stringify(props.value, null, 2),
      extensions: getExtensions(),
    });
    editor.value = new EditorView({
      state,
      parent: container.value,
    });
  });

  onBeforeUnmount(() => {
    editor.value?.destroy();
  });

  watch(
    () => props.value,
    newVal => {
      updateContent(newVal);
    },
    { deep: true },
  );
</script>

<template>
  <div ref="container" class="json-codemirror" />
</template>

<script setup lang="ts">
  import './cubeflow.scss';

  import { computed } from 'vue';

  import CubeflowBox from '@/view/assets/images/cubeflow-box.webp';
  import CubeflowLogo from '@/view/assets/images/cubeflow.webp';
  import { useI18n } from '~/composables/useI18n';

  interface CubeflowFeature {
    title: string;
    text: string;
  }

  const { t, tm } = useI18n();

  const features = computed(() => (tm('cubeflow.features') as CubeflowFeature[]) || []);
</script>

<template>
  <div class="cubeflow">
    <div class="cubeflow__container">
      <div class="cubeflow__promo">
        <a class="cubeflow__link" href="https://cubeflow.retrosteam.ru" target="_blank">
          <VImage
            class="cubeflow__logo"
            :src="CubeflowLogo"
            hazehash="OcmTtuGiyn_YnjdxlyMA-vXhXW1UyxNKqxXtWw"
            :width="800"
            :height="164"
            alt="Cubeflow"
            :lazy="true"
          />
          <div class="cubeflow__scene">
            <div class="cubeflow__box">
              <VImage
                class="cubeflow__box-iamge"
                :src="CubeflowBox"
                hazehash="L0wOutuAQLdoSalzNY666lpa-4k5St7fVpu5bQ"
                :width="599"
                :height="698"
                alt="Cubeflow box"
                :lazy="true"
              />
            </div>

            <span class="cubeflow__shadow" />
          </div>
        </a>
        <div class="cubeflow__subtitle">{{ t('cubeflow.subtitle') }}</div>
      </div>

      <ul class="cubeflow__features">
        <li
          v-for="(feature, index) in features"
          :key="feature.title"
          class="cubeflow__feature"
        >
          <div
            class="cubeflow__feature-icon"
            :class="`cubeflow__feature-icon_${index + 1}`"
            aria-hidden="true"
          />
          <div class="cubeflow__feature-title">{{ feature.title }}</div>
          <div class="cubeflow__feature-text">{{ feature.text }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

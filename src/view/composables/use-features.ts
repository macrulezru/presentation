import { computed } from 'vue';

import { FeaturesEnum } from '@/enums/features.enum';
import { useI18n } from '@/view/composables/use-i18n.ts';

export interface SectionItem {
  name?: string;
  description?: string;
  title?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeatureData {
  id: string;
  icon: string;
  image: string;
  imageHorizontal: string;
  video: string;
  videoHorizontal: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  features: {
    title: string;
    items: Record<string, FeatureItem>;
  };
  architecture: {
    title: string;
    items: SectionItem[];
  };
  process: {
    title: string;
    steps: SectionItem[];
  };
  benefits: {
    title: string;
    items: string[];
  };
  accentColor: string;
}

export function useFeatures() {
  const { t, tm } = useI18n();

  const featuresConfig = computed(() => [
    {
      id: FeaturesEnum.UI_COMPONENTS,
      i18nKey: 'uiComponents',
      accentColor: '#bd0e3d',
      mainIcon: 'ui',
      image: '/src/view/assets/images/ui-image.jpg',
      imageHorizontal: '/src/view/assets/images/ui-image-horizontal.jpg',
      video: '/src/view/assets/video/ui-video_loop.mp4',
      videoHorizontal: '/src/view/assets/video/ui-video-horizontal_loop.mp4',
    },
    {
      id: FeaturesEnum.PIPELINE,
      i18nKey: 'pipeline',
      accentColor: '#3498db',
      mainIcon: 'pipeline',
      image: '/src/view/assets/images/pipeline-image.jpg',
      imageHorizontal: '/src/view/assets/images/pipeline-image-horizontal.jpg',
      video: '/src/view/assets/video/pipeline-video_loop.mp4',
      videoHorizontal: '/src/view/assets/video/pipeline-video-horizontal_loop.mp4',
    },
    {
      id: FeaturesEnum.LOCALIZATION,
      i18nKey: 'localization',
      accentColor: '#9b59b6',
      mainIcon: 'localization',
      image: '/src/view/assets/images/i18n-image.jpg',
      imageHorizontal: '/src/view/assets/images/i18n-image-horizontal.jpg',
      video: '/src/view/assets/video/i18n-video_loop.mp4',
      videoHorizontal: '/src/view/assets/video/i18n-video-horizontal_loop.mp4',
    },
    {
      id: FeaturesEnum.SEAT_MAP,
      i18nKey: 'seatMap',
      accentColor: '#e67e22',
      mainIcon: 'seat',
      image: '/src/view/assets/images/seatmap-image.jpg',
      imageHorizontal: '/src/view/assets/images/seatmap-image-horizontal.jpg',
      video: '/src/view/assets/video/seatmap-video_loop.mp4',
      videoHorizontal: '/src/view/assets/video/seatmap-video-horizontal_loop.mp4',
    },
    {
      id: FeaturesEnum.MULTISYNC,
      i18nKey: 'multisync',
      accentColor: '#4b6ff1',
      mainIcon: 'synchronization',
      image: '/src/view/assets/images/synchronization-image.jpg',
      imageHorizontal: '/src/view/assets/images/synchronization-image-horizontal.jpg',
      video: '/src/view/assets/video/synchronization-video_loop.mp4',
      videoHorizontal: '/src/view/assets/video/synchronization-video-horizontal_loop.mp4',
    },
  ]);

  const features = computed((): FeatureData[] =>
    featuresConfig.value.map(config => {
      const { i18nKey } = config;

      const image = new URL(config.image, import.meta.url).href;
      const imageHorizontal = new URL(config.imageHorizontal, import.meta.url).href;
      const video = new URL(config.video, import.meta.url).href;
      const videoHorizontal = new URL(config.videoHorizontal, import.meta.url).href;

      return {
        id: config.id,
        icon: config.mainIcon,
        image,
        imageHorizontal,
        video,
        videoHorizontal,
        title: t(`${i18nKey}.title`),
        shortTitle: t(`${i18nKey}.shortTitle`),
        subtitle: t(`${i18nKey}.subtitle`),
        description: t(`${i18nKey}.description`),
        features: {
          title: t(`${i18nKey}.features.title`),
          items: tm(`${i18nKey}.features.items`) as Record<string, FeatureItem>,
        },
        architecture: {
          title: t(`${i18nKey}.architecture.title`),
          items: tm(`${i18nKey}.architecture.items`) as SectionItem[],
        },
        process: {
          title: t(`${i18nKey}.process.title`),
          steps: tm(`${i18nKey}.process.steps`) as SectionItem[],
        },
        benefits: {
          title: t(`${i18nKey}.benefits.title`),
          items: tm(`${i18nKey}.benefits.items`) as string[],
        },
        accentColor: config.accentColor,
      };
    }),
  );

  const getFeatureById = (id: string) => {
    return features.value.find(feature => feature.id === id);
  };

  return {
    features,
    getFeatureById,
  };
}

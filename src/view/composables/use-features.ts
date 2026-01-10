import { computed } from 'vue';

import { FeaturesEnum } from '@/enums/features.enum';
import i18nImageHorizonatl from '@/view/assets/images/i18n-image-horizontal.webp';
import i18nImage from '@/view/assets/images/i18n-image.webp';
import pipelineImageHorizontal from '@/view/assets/images/pipeline-image-horizontal.webp';
import pipelineImage from '@/view/assets/images/pipeline-image.webp';
import seatmapImageHorizontal from '@/view/assets/images/seatmap-image-horizontal.webp';
import seatmapImage from '@/view/assets/images/seatmap-image.webp';
import synchronizationImageHorizontal from '@/view/assets/images/synchronization-image-horizontal.webp';
import synchronizationImage from '@/view/assets/images/synchronization-image.webp';
import uiImageHorizontal from '@/view/assets/images/ui-image-horizontal.webp';
import uiImage from '@/view/assets/images/ui-image.webp';
import i18nVideoHorizonatl from '@/view/assets/video/i18n-video-horizontal_loop.mp4';
import i18nVideo from '@/view/assets/video/i18n-video_loop.mp4';
import pipelineVideoHorizontal from '@/view/assets/video/pipeline-video-horizontal_loop.mp4';
import pipelineVideo from '@/view/assets/video/pipeline-video_loop.mp4';
import seatmapVideoHorizontal from '@/view/assets/video/seatmap-video-horizontal_loop.mp4';
import seatmapVideo from '@/view/assets/video/seatmap-video_loop.mp4';
import synchronizationVideoHorizontal from '@/view/assets/video/synchronization-video-horizontal_loop.mp4';
import synchronizationVideo from '@/view/assets/video/synchronization-video_loop.mp4';
import uiVideoHorizontal from '@/view/assets/video/ui-video-horizontal_loop.mp4';
import uiVideo from '@/view/assets/video/ui-video_loop.mp4';
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
      image: uiImage,
      imageHorizontal: uiImageHorizontal,
      video: uiVideo,
      videoHorizontal: uiVideoHorizontal,
    },
    {
      id: FeaturesEnum.PIPELINE,
      i18nKey: 'pipeline',
      accentColor: '#3498db',
      mainIcon: 'pipeline',
      image: pipelineImage,
      imageHorizontal: pipelineImageHorizontal,
      video: pipelineVideo,
      videoHorizontal: pipelineVideoHorizontal,
    },
    {
      id: FeaturesEnum.LOCALIZATION,
      i18nKey: 'localization',
      accentColor: '#9b59b6',
      mainIcon: 'localization',
      image: i18nImage,
      imageHorizontal: i18nImageHorizonatl,
      video: i18nVideo,
      videoHorizontal: i18nVideoHorizonatl,
    },
    {
      id: FeaturesEnum.SEAT_MAP,
      i18nKey: 'seatMap',
      accentColor: '#e67e22',
      mainIcon: 'seat',
      image: seatmapImage,
      imageHorizontal: seatmapImageHorizontal,
      video: seatmapVideo,
      videoHorizontal: seatmapVideoHorizontal,
    },
    {
      id: FeaturesEnum.MULTISYNC,
      i18nKey: 'multisync',
      accentColor: '#4b6ff1',
      mainIcon: 'synchronization',
      image: synchronizationImage,
      imageHorizontal: synchronizationImageHorizontal,
      video: synchronizationVideo,
      videoHorizontal: synchronizationVideoHorizontal,
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

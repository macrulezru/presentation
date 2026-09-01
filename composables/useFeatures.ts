import { computed } from 'vue';

import { FeaturesEnum } from '@/enums/features.enum';
import apiMonitorImageHorizontal from '@/view/assets/images/api-monitor-horizontal.webp';
import apiMonitorImage from '@/view/assets/images/api-monitor.webp';
import appPlatformImageHorizontal from '@/view/assets/images/app-platform-horizontal.webp';
import appPlatformImage from '@/view/assets/images/app-platform.webp';
import i18nImageHorizonatl from '@/view/assets/images/i18n-image-horizontal.webp';
import i18nImage from '@/view/assets/images/i18n-image.webp';
import pipelineImageHorizontal from '@/view/assets/images/pipeline-image-horizontal.webp';
import pipelineImage from '@/view/assets/images/pipeline-image.webp';
import uiImageHorizontal from '@/view/assets/images/ui-image-horizontal.webp';
import uiImage from '@/view/assets/images/ui-image.webp';
import { useI18n } from '~/composables/useI18n';

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
  title: string;
  shortTitle: string;
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
    },
    {
      id: FeaturesEnum.PIPELINE,
      i18nKey: 'pipeline',
      accentColor: '#3498db',
      mainIcon: 'pipeline',
      image: pipelineImage,
      imageHorizontal: pipelineImageHorizontal,
    },
    {
      id: FeaturesEnum.REST_MONITORING,
      i18nKey: 'restMonitoring',
      accentColor: '#e74c3c',
      mainIcon: 'monitoring',
      image: apiMonitorImage,
      imageHorizontal: apiMonitorImageHorizontal,
    },
    {
      id: FeaturesEnum.DEPLOY_PLATFORM,
      i18nKey: 'deployPlatform',
      accentColor: '#1abc9c',
      mainIcon: 'deploy',
      image: appPlatformImage,
      imageHorizontal: appPlatformImageHorizontal,
    },
    {
      id: FeaturesEnum.LOCALIZATION,
      i18nKey: 'localization',
      accentColor: '#9b59b6',
      mainIcon: 'localization',
      image: i18nImage,
      imageHorizontal: i18nImageHorizonatl,
    },
  ]);

  const features = computed((): FeatureData[] =>
    featuresConfig.value.map(config => {
      const { i18nKey } = config;

      const { image } = config;
      const { imageHorizontal } = config;

      return {
        id: config.id,
        icon: config.mainIcon,
        image,
        imageHorizontal,
        title: t(`${i18nKey}.title`),
        shortTitle: t(`${i18nKey}.shortTitle`),
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

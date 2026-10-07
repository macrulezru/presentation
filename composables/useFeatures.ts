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
import seatmapImageHorizontal from '@/view/assets/images/seatmap-image-horizontal.webp';
import seatmapImage from '@/view/assets/images/seatmap-image.webp';
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
  image: {
    image: string;
    hazehash: string;
    width: number;
    height: number;
  };
  imageHorizontal: {
    image: string;
    hazehash: string;
    width: number;
    height: number;
  };
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
      image: {
        image: uiImage,
        hazehash: 'Dd4JvOKAQLJ5O244i81E07OKrV1hu4hmmXeJhw',
        width: 720,
        height: 1080,
      },
      imageHorizontal: {
        image: uiImageHorizontal,
        hazehash: 'E_sHvOOYSI2t62AjisNzmzBfBxGJAFS1EKUpUQ',
        width: 800,
        height: 450,
      },
    },
    {
      id: FeaturesEnum.PIPELINE,
      i18nKey: 'pipeline',
      accentColor: '#3498db',
      image: {
        image: pipelineImage,
        hazehash: 'DOwGuuMAQKg75T4bwNJFU7urzNraQbtusaqlSQ',
        width: 720,
        height: 1279,
      },
      imageHorizontal: {
        image: pipelineImageHorizontal,
        hazehash: 'E_xGuuwgMCvv0EPkVNh4TphSmmob4vRy7iNPMw',
        width: 800,
        height: 450,
      },
    },
    {
      id: FeaturesEnum.REST_MONITORING,
      i18nKey: 'restMonitoring',
      accentColor: '#e74c3c',
      image: {
        image: apiMonitorImage,
        hazehash: 'DepmvtqJVKpOd3tuhaTV44WLFJVUt4iVzW6Y0w',
        width: 720,
        height: 1080,
      },
      imageHorizontal: {
        image: apiMonitorImageHorizontal,
        hazehash: 'E-0GOuMQSElzuWuBJEVREI3wG5YbpG2XGFhhKw',
        width: 800,
        height: 450,
      },
    },
    {
      id: FeaturesEnum.DEPLOY_PLATFORM,
      i18nKey: 'deployPlatform',
      accentColor: '#1abc9c',
      image: {
        image: appPlatformImage,
        hazehash: 'DOxGuuwgsoHv3Kn4WUuY497WrFyXyTdXz4yMtA',
        width: 720,
        height: 1279,
      },
      imageHorizontal: {
        image: appPlatformImageHorizontal,
        hazehash: 'E-wGuuMAQFZ55g8CEjNJoZlUpIOMI5mhxghoyQ',
        width: 800,
        height: 450,
      },
    },
    {
      id: FeaturesEnum.LOCALIZATION,
      i18nKey: 'localization',
      accentColor: '#9b59b6',
      image: {
        image: i18nImage,
        hazehash: 'DewGvNuAQFD3OFwXSSD2HlxgU0bxDN4M4dZKmw',
        width: 720,
        height: 1080,
      },
      imageHorizontal: {
        image: i18nImageHorizonatl,
        hazehash: 'E-xGuuQYUIazthOCkVQqrLuhumwZpFp4oLEWQw',
        width: 800,
        height: 450,
      },
    },
    {
      id: FeaturesEnum.SEAT_MAP,
      i18nKey: 'seatMap',
      accentColor: '#409724',
      image: {
        image: seatmapImage,
        hazehash: 'DOxGuuuYUDK3zhp0gUpBlG6rkjDKMpOGptGQqw',
        width: 720,
        height: 1279,
      },
      imageHorizontal: {
        image: seatmapImageHorizontal,
        hazehash: 'E-8GOuuYKNX79PBv4BpoeBcTg0ROqXVKZ4A8VA',
        width: 800,
        height: 450,
      },
    },
  ]);

  const features = computed((): FeatureData[] =>
    featuresConfig.value.map(config => {
      const { i18nKey } = config;

      const { image } = config;
      const { imageHorizontal } = config;

      return {
        id: config.id,
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

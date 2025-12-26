import { computed } from 'vue'
import { useI18n } from '@/view/composables/use-i18n.ts'
import { FeaturesEnum } from '@/enums/features.enum'

export interface SectionItem {
  name?: string
  description?: string
  title?: string
}

export interface FeatureData {
  id: string
  icon: string
  title: string
  subtitle: string
  description: string
  features: {
    title: string
    items: string[]
  }
  architecture: {
    title: string
    items: SectionItem[]
  }
  process: {
    title: string
    steps: SectionItem[]
  }
  benefits: {
    title: string
    items: string[]
  }
  accentColor: string
}

export function useFeatures() {
  const { t, tm } = useI18n()

  const featuresConfig = computed(() => [
    {
      id: FeaturesEnum.UI_COMPONENTS,
      i18nKey: 'uiComponents',
      accentColor: 'var(--color-accent-ui)',
      mainIcon: 'ui',
    },
    {
      id: FeaturesEnum.PIPELINE,
      i18nKey: 'pipeline',
      accentColor: 'var(--color-secondary)',
      mainIcon: 'pipeline',
    },
    {
      id: FeaturesEnum.LOCALIZATION,
      i18nKey: 'localization',
      accentColor: 'var(--color-accent-purple)',
      mainIcon: 'localization',
    },
    {
      id: FeaturesEnum.SEAT_MAP,
      i18nKey: 'seatMap',
      accentColor: 'var(--color-accent-orange)',
      mainIcon: 'seat',
    },
    {
      id: FeaturesEnum.MULTISYNC,
      i18nKey: 'multisync',
      accentColor: 'var(--color-accent-blue)',
      mainIcon: 'synchronization',
    },
  ])

  const features = computed((): FeatureData[] =>
    featuresConfig.value.map(config => {
      const i18nKey = config.i18nKey

      return {
        id: config.id,
        icon: config.mainIcon,
        title: t(`${i18nKey}.title`),
        subtitle: t(`${i18nKey}.subtitle`),
        description: t(`${i18nKey}.description`),
        features: {
          title: t(`${i18nKey}.features.title`),
          items: tm(`${i18nKey}.features.items`) as string[],
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
      }
    }),
  )

  const getFeatureById = (id: string) => {
    return features.value.find(feature => feature.id === id)
  }

  return {
    features,
    getFeatureById,
  }
}

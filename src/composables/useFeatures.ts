import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface SectionItem {
  name?: string
  description?: string
  title?: string
}

export interface FeatureData {
  id: string
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
  featureIcon: string
}

export function useFeatures() {
  const { t, tm } = useI18n()

  const featuresConfig = computed(() => [
    {
      id: 'pipeline',
      i18nKey: 'pipeline',
      accentColor: 'var(--color-secondary)',
      featureIcon: '✓',
    },
    {
      id: 'localization',
      i18nKey: 'localization',
      accentColor: 'var(--color-accent-purple)',
      featureIcon: '🌍',
    },
    {
      id: 'seat-map',
      i18nKey: 'seatMap',
      accentColor: 'var(--color-accent-orange)',
      featureIcon: '✈️',
    },
  ])

  const features = computed((): FeatureData[] =>
    featuresConfig.value.map(config => {
      const i18nKey = config.i18nKey

      return {
        id: config.id,
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
        featureIcon: config.featureIcon,
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

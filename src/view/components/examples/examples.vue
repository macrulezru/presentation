<script setup lang="ts">
  import FeatureItem from '@/view/components/examples/parts/feature-item/feature-item.vue'
  import Button from '@/view/ui/ui-button/ui-button.vue'

  import '@/view/components/examples/examples.scss'

  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useFeatures } from '@/view/composables/use-features.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'

  const { t } = useI18n()

  const { features } = useFeatures()
  const { navigateToSection } = useScrollRouting()

  const toContactSection = () => {
    navigateToSection(PageSectionsEnum.CONTACTS)
  }
</script>

<template>
  <div>
    <h3 class="examples__title">{{ t('app.examples_title') }}</h3>
    <div class="examples__demonstration">
      <div class="examples__demonstration-container">
        <div class="examples__demonstration-content">
          <h2 class="examples__demonstration-title">
            {{ t('demonstration.title') }}
          </h2>
          <p class="examples__demonstration-description">
            {{ t('demonstration.description') }}
          </p>
          <div class="examples__demonstration-readiness">
            <div class="examples__demonstration-icon" />
            <p>{{ t('demonstration.readiness') }}</p>
            <div>
              <Button
                small
                :text="t('demonstration.contact_me_conveniently')"
                @click="toContactSection"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="examples__features">
      <div class="examples__features-container">
        <div class="examples__features-list">
          <FeatureItem v-for="feature in features" :key="feature.id" :feature="feature" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import FeatureItem from '@/view/components/examples/parts/feature-item/feature-item.vue'
  import Button from '@/view/ui/ui-button/ui-button.vue'
  import LoadingSpinner from '@/view/ui/ui-loading-spinner/ui-loading-spinner.vue'

  import '@/view/components/examples/examples.scss'

  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useFeatures } from '@/view/composables/use-features.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'
  import { FeanuresEnum } from '@/enums/features.enum'

  const RestApi = defineAsyncComponent({
    loader: () =>
      import(
        '@/view/components/rest-api/rest-api.vue'
      ),
    loadingComponent: LoadingSpinner,
    delay: 200,
    timeout: 10000,
    errorComponent: {
      template: `
      <div class="travelshop__error">
        <p>{{ $t('travelshop.loading_error') }}</p>
      </div>
    `,
    },
  })

  const { t } = useI18n()

  const { features } = useFeatures()
  const { navigateToSection } = useScrollRouting()

  const isShowRestApi = ref<boolean>(false)

  const toContactSection = () => {
    navigateToSection(PageSectionsEnum.CONTACTS)
  }

  const showRestApi = () => {
    isShowRestApi.value = true
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
          <template v-for="feature in features" :key="feature.id">
            <FeatureItem :feature="feature">
              <template v-if="feature.id === FeanuresEnum.PIPLINE">
                <div v-if="!isShowRestApi" class="examples__rest-api">
                  <Button :text="t('rest-api.button')" @click="showRestApi" />
                </div>
                <RestApi v-if="isShowRestApi" />
              </template>
            </FeatureItem>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

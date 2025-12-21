<script setup lang="ts">
  import EmptyState from '@/view/components/rest-api/parts/empty-state/empty-state.vue'

  import '@/view/components/rest-api/parts/product-formatted-column/product-formatted-column.scss'

  import type { ProductModel } from '@/models/product.model.ts'
  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t } = useI18n()

  interface Props {
    formattedData: ProductModel | null
    loading: boolean
    error: string | null
  }

  defineProps<Props>()
</script>

<template>
  <div class="product-formatted-column">
    <EmptyState v-if="loading" :loading="true" />

    <div v-else-if="error" class="product-formatted-column__error-container">
      <pre>{{ error }}</pre>
    </div>

    <div v-else-if="formattedData" class="product-formatted-column__content">
      <!-- Product Header Section -->
      <div class="product-formatted-column__header-section">
        <div class="product-formatted-column__header">
          <img
            :src="formattedData.MainImage"
            :alt="formattedData.Title"
            class="product-formatted-column__main-image"
          />
          <div class="product-formatted-column__title-info">
            <h4 class="product-formatted-column__title">{{ formattedData.Title }}</h4>
            <p class="product-formatted-column__brand-category">
              <span v-if="formattedData.Brand" class="product-formatted-column__brand">
                {{ formattedData.Brand }}
              </span>
              <span class="product-formatted-column__category">
                {{ formattedData.Category }}
              </span>
            </p>

            <!-- Rating -->
            <div class="product-formatted-column__rating">
              <div class="product-formatted-column__stars">
                <span
                  v-for="n in formattedData.RatingStars.full"
                  :key="'full-' + n"
                  class="product-formatted-column__star-full"
                >
                  ★
                </span>
                <span
                  v-if="formattedData.RatingStars.half"
                  class="product-formatted-column__star-half"
                >
                  ★
                </span>
                <span
                  v-for="n in formattedData.RatingStars.empty"
                  :key="'empty-' + n"
                  class="product-formatted-column__star-empty"
                >
                  ★
                </span>
              </div>
              <span class="product-formatted-column__rating-value">
                {{ formattedData.AverageRating.toFixed(1) }} ({{
                  formattedData.ReviewCount
                }}
                reviews)
              </span>
            </div>
          </div>
        </div>

        <!-- Price Section -->
        <div class="product-formatted-column__price-section">
          <div class="product-formatted-column__current-price">
            {{ formattedData.FormattedDiscountedPrice }}
          </div>
          <div
            v-if="formattedData.DiscountPercentage > 0"
            class="product-formatted-column__original-price"
          >
            {{ formattedData.FormattedPrice }}
          </div>
          <div
            v-if="formattedData.DiscountPercentage > 0"
            class="product-formatted-column__discount-badge"
          >
            -{{ formattedData.DiscountPercentage.toFixed(1) }}%
          </div>
        </div>
      </div>

      <!-- Product Meta Info -->
      <div class="product-formatted-column__meta-grid">
        <div class="product-formatted-column__meta-item">
          <strong>{{ t('rest-api.product.sku') }}</strong>
          {{ formattedData.Sku }}
        </div>
        <div class="product-formatted-column__meta-item">
          <strong>{{ t('rest-api.product.stock') }}</strong>
          <span
            :class="{
              'product-formatted-column__in-stock': formattedData.IsInStock,
              'product-formatted-column__out-of-stock': !formattedData.IsInStock,
            }"
          >
            {{ formattedData.Stock }}
            {{
              formattedData.IsInStock
                ? t('rest-api.product.inStock')
                : t('product.outOfStock')
            }}
          </span>
        </div>
        <div class="product-formatted-column__meta-item">
          <strong>{{ t('rest-api.product.weight') }}</strong>
          {{ formattedData.WeightFormatted }}
        </div>
        <div class="product-formatted-column__meta-item">
          <strong>{{ t('rest-api.product.dimensions') }}</strong>
          {{ formattedData.DimensionsFormatted }}
        </div>
      </div>

      <!-- Description -->
      <div class="product-formatted-column__description">
        <h5>{{ t('rest-api.product.description') }}</h5>
        <p>{{ formattedData.Description }}</p>
      </div>

      <!-- Tags -->
      <div v-if="formattedData.Tags.length > 0" class="product-formatted-column__tags">
        <h5>{{ t('rest-api.product.tags') }}</h5>
        <div class="product-formatted-column__tags-list">
          <span
            v-for="tag in formattedData.Tags"
            :key="tag"
            class="product-formatted-column__tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="product-formatted-column__additional-info">
        <div class="product-formatted-column__info-item">
          <strong>{{ t('rest-api.product.warranty') }}</strong>
          {{ formattedData.WarrantyInfo }}
        </div>
        <div class="product-formatted-column__info-item">
          <strong>{{ t('rest-api.product.shipping') }}</strong>
          {{ formattedData.ShippingInfo }}
        </div>
        <div class="product-formatted-column__info-item">
          <strong>{{ t('rest-api.product.returnPolicy') }}</strong>
          {{ formattedData.ReturnPolicy }}
        </div>
        <div class="product-formatted-column__info-item">
          <strong>{{ t('rest-api.product.minOrder') }}</strong>
          {{ formattedData.minimumOrderQuantity }} units
        </div>
      </div>

      <!-- Reviews Section -->
      <div
        v-if="formattedData.Reviews.length > 0"
        class="product-formatted-column__reviews"
      >
        <h5>{{ t('rest-api.product.reviews') }} ({{ formattedData.ReviewCount }})</h5>
        <div
          v-for="review in formattedData.Reviews"
          :key="review.reviewerEmail + review.date"
          class="product-formatted-column__review"
        >
          <div class="product-formatted-column__review-header">
            <span class="product-formatted-column__reviewer">
              {{ review.reviewerName }}
            </span>
            <span class="product-formatted-column__review-rating">
              {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
            </span>
            <span class="product-formatted-column__review-date">
              {{ new Date(review.date).toLocaleDateString() }}
            </span>
          </div>
          <p class="product-formatted-column__review-comment">{{ review.comment }}</p>
        </div>
      </div>
    </div>

    <EmptyState v-else />
  </div>
</template>

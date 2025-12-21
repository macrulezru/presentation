<script setup lang="ts">
  import ApiDemoBlock from '@/view/components/rest-api/parts/api-demo-block/api-demo-block.vue'
  import JokeFormattedColumn from '@/view/components/rest-api/parts/joke-formatted-column/joke-formatted-column.vue'
  import PersonFormattedColumn from '@/view/components/rest-api/parts/person-formatted-column/person-formatted-column.vue'
  import ProductFormattedColumn from '@/view/components/rest-api/parts/product-formatted-column/product-formatted-column.vue'
  import Tabs from '@/view/ui/ui-tabs/ui-tabs.vue'
  import Tab from '@/view/ui/ui-tabs/parts/ui-tab/ui-tab.vue'

  import './rest-api.scss'

  import { ref } from 'vue'
  import { jokeCommand } from '@/core/commands/joke.command'
  import { personCommand } from '@/core/commands/person.command'
  import { productCommand } from '@/core/commands/product.command'
  import type { JokeModel } from '@/models/joke.model'
  import { PersonResponseModel } from '@/models/person-response.model'
  import { ProductModel } from '@/models/product.model'
  import { jokeConfig, personConfig, productConfig } from '@/core/config'
  import { RestApiCommandEnum } from '@/enums/rest-api.enum'
  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t } = useI18n()

  const jokeApiInfo = {
    baseUrl: jokeConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.RANDOM_JOKE}`,
    method: 'GET',
    fullUrl: `${jokeConfig.baseURL}/${RestApiCommandEnum.RANDOM_JOKE}`,
  }

  const personApiInfo = {
    baseUrl: personConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.PERSON}`,
    method: 'GET',
    fullUrl: `${personConfig.baseURL}/${RestApiCommandEnum.PERSON}`,
  }

  const productApiInfo = {
    baseUrl: productConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.PRODUCT}`,
    method: 'GET',
    fullUrl: `${productConfig.baseURL}/${RestApiCommandEnum.PRODUCT}`,
  }

  const jokeState = ref({
    loading: false,
    requestInfo: {
      url: jokeApiInfo.fullUrl,
      method: jokeApiInfo.method,
    },
    rawResponse: null as any,
    formattedData: null as JokeModel | null,
    error: null as string | null,
  })

  const personState = ref({
    loading: false,
    requestInfo: {
      url: personApiInfo.fullUrl,
      method: personApiInfo.method,
    },
    rawResponse: null as any,
    formattedData: null as PersonResponseModel | null,
    error: null as string | null,
  })

  const productState = ref({
    loading: false,
    requestInfo: {
      url: productApiInfo.fullUrl,
      method: productApiInfo.method,
    },
    rawResponse: null as any,
    formattedData: null as ProductModel | null,
    error: null as string | null,
  })

  const fetchJoke = async () => {
    jokeState.value = {
      ...jokeState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    }

    try {
      const command = jokeCommand.getRandomJoke()
      const result = await command.execute()
      jokeState.value.rawResponse = result
      jokeState.value.formattedData = result
    } catch (error: any) {
      jokeState.value.error = error.message || t('rest-api.unknownError')
    } finally {
      jokeState.value.loading = false
    }
  }

  const fetchRandomPerson = async () => {
    personState.value = {
      ...personState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    }

    try {
      const command = personCommand.getRandomPerson()
      const result = await command.execute()
      personState.value.rawResponse = result
      personState.value.formattedData = result
    } catch (error: any) {
      personState.value.error = error.message || t('rest-api.unknownError')
    } finally {
      personState.value.loading = false
    }
  }

  const fetchProduct = async () => {
    productState.value = {
      ...productState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    }

    try {
      const command = productCommand.getRandomProduct()
      const result = await command.execute()

      productState.value.rawResponse = result
      productState.value.formattedData = result
    } catch (error: any) {
      productState.value.error = error.message || t('rest-api.unknownError')
    } finally {
      productState.value.loading = false
    }
  }

  const clearJokeData = () => {
    jokeState.value = {
      ...jokeState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    }
  }

  const clearPersonData = () => {
    personState.value = {
      ...personState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    }
  }

  const clearProductData = () => {
    productState.value = {
      ...productState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    }
  }
</script>

<template>
  <div class="rest-api">
    <Tabs>
      <Tab :title="t('rest-api.productApiTitle')">
        <ApiDemoBlock
          :loading="productState.loading"
          :error="productState.error"
          :request-info="productState.requestInfo"
          :raw-response="productState.rawResponse"
          :api-info="productApiInfo"
          @fetch="fetchProduct"
          @clear="clearProductData"
        >
          <template #formatted-data>
            <ProductFormattedColumn
              :formatted-data="productState.formattedData"
              :loading="productState.loading"
              :error="productState.error"
            />
          </template>
        </ApiDemoBlock>
      </Tab>
      <Tab :title="t('rest-api.jokeApiTitle')">
        <ApiDemoBlock
          :loading="jokeState.loading"
          :error="jokeState.error"
          :request-info="jokeState.requestInfo"
          :raw-response="jokeState.rawResponse"
          :api-info="jokeApiInfo"
          @fetch="fetchJoke"
          @clear="clearJokeData"
        >
          <template #formatted-data>
            <JokeFormattedColumn
              :formatted-data="jokeState.formattedData"
              :loading="jokeState.loading"
              :error="jokeState.error"
            />
          </template>
        </ApiDemoBlock>
      </Tab>
      <Tab :title="t('rest-api.personApiTitle')">
        <ApiDemoBlock
          :loading="personState.loading"
          :error="personState.error"
          :request-info="personState.requestInfo"
          :raw-response="personState.rawResponse"
          :api-info="personApiInfo"
          @fetch="fetchRandomPerson"
          @clear="clearPersonData"
        >
          <template #formatted-data>
            <PersonFormattedColumn
              :formatted-data="personState.formattedData"
              :loading="personState.loading"
              :error="personState.error"
            />
          </template>
        </ApiDemoBlock>
      </Tab>
    </Tabs>
  </div>
</template>

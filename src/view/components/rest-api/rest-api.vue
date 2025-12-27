<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue';

  import type { JokeModel } from '@/models/joke.model';

  import { jokeCommand } from '@/core/commands/joke.command';
  import { personCommand } from '@/core/commands/person.command';
  import { productCommand } from '@/core/commands/product.command';
  import { jokeConfig, personConfig, productConfig } from '@/core/config';
  import { RestApiCommandEnum } from '@/enums/rest-api.enum';
  import { PersonResponseModel } from '@/models/person-response.model';
  import { ProductModel } from '@/models/product.model';
  import { useWarmupStore } from '@/stores/use-warmup-store';
  import ApiDemoBlock from '@/view/components/rest-api/parts/api-demo-block/api-demo-block.vue';
  import JokeFormattedColumn from '@/view/components/rest-api/parts/joke-formatted-column/joke-formatted-column.vue';
  import PersonFormattedColumn from '@/view/components/rest-api/parts/person-formatted-column/person-formatted-column.vue';
  import ProductFormattedColumn from '@/view/components/rest-api/parts/product-formatted-column/product-formatted-column.vue';
  import WarmupApi from '@/view/components/rest-api/parts/warmup-api/warmup-api.vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import Tab from '@/view/ui/ui-tabs/parts/ui-tab/ui-tab.vue';
  import Tabs from '@/view/ui/ui-tabs/ui-tabs.vue';

  import '@/view/components/rest-api/rest-api.scss';

  const { t } = useI18n();

  const warmupStore = useWarmupStore();
  const { warmupStatus } = storeToRefs(warmupStore);

  const jokeApiInfo = {
    baseUrl: jokeConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.RANDOM_JOKE}`,
    method: 'GET',
    fullUrl: `${jokeConfig.baseURL}/${RestApiCommandEnum.RANDOM_JOKE}`,
  };

  const personApiInfo = {
    baseUrl: personConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.PERSON}`,
    method: 'GET',
    fullUrl: `${personConfig.baseURL}/${RestApiCommandEnum.PERSON}`,
  };

  const productApiInfo = {
    baseUrl: productConfig.baseURL,
    endpoint: `/${RestApiCommandEnum.PRODUCT}`,
    method: 'GET',
    fullUrl: `${productConfig.baseURL}/${RestApiCommandEnum.PRODUCT}`,
  };

  const jokeState = ref({
    loading: false,
    requestInfo: {
      url: jokeApiInfo.fullUrl,
      method: jokeApiInfo.method,
    },
    rawResponse: null as unknown,
    formattedData: null as JokeModel | null,
    error: null as string | null,
  });

  const personState = ref({
    loading: false,
    requestInfo: {
      url: personApiInfo.fullUrl,
      method: personApiInfo.method,
    },
    rawResponse: null as unknown,
    formattedData: null as PersonResponseModel | null,
    error: null as string | null,
  });

  const productState = ref({
    loading: false,
    requestInfo: {
      url: productApiInfo.fullUrl,
      method: productApiInfo.method,
    },
    rawResponse: null as unknown,
    formattedData: null as ProductModel | null,
    error: null as string | null,
  });

  const fetchJoke = async () => {
    jokeState.value = {
      ...jokeState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    };

    try {
      const command = jokeCommand.getRandomJoke();
      const result = await command.execute();
      jokeState.value.rawResponse = result;
      jokeState.value.formattedData = result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        jokeState.value.error = error.message || t('rest-api.unknownError');
      } else {
        jokeState.value.error = t('rest-api.unknownError');
      }
    } finally {
      jokeState.value.loading = false;
    }
  };

  const fetchRandomPerson = async () => {
    personState.value = {
      ...personState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    };

    try {
      const command = personCommand.getRandomPerson();
      const result = await command.execute();
      personState.value.rawResponse = result;
      personState.value.formattedData = result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        personState.value.error = error.message || t('rest-api.unknownError');
      } else {
        personState.value.error = t('rest-api.unknownError');
      }
    } finally {
      personState.value.loading = false;
    }
  };

  const fetchProduct = async () => {
    productState.value = {
      ...productState.value,
      loading: true,
      rawResponse: null,
      formattedData: null,
      error: null,
    };

    try {
      const command = productCommand.getRandomProduct();
      const result = await command.execute();

      productState.value.rawResponse = result;
      productState.value.formattedData = result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        productState.value.error = error.message || t('rest-api.unknownError');
      } else {
        productState.value.error = t('rest-api.unknownError');
      }
    } finally {
      productState.value.loading = false;
    }
  };

  const clearJokeData = () => {
    jokeState.value = {
      ...jokeState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    };
  };

  const clearPersonData = () => {
    personState.value = {
      ...personState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    };
  };

  const clearProductData = () => {
    productState.value = {
      ...productState.value,
      loading: false,
      rawResponse: null,
      formattedData: null,
      error: null,
    };
  };
</script>

<template>
  <div class="rest-api">
    <WarmupApi v-if="!warmupStatus" />
    <Tabs v-else>
      <Tab :title="t('rest-api.productApiTitle')">
        <ApiDemoBlock
          :loading="productState.loading"
          :error="productState.error"
          :requestInfo="productState.requestInfo"
          :rawResponse="productState.rawResponse"
          :apiInfo="productApiInfo"
          @fetch="fetchProduct"
          @clear="clearProductData"
        >
          <template #formatted-data>
            <ProductFormattedColumn
              :formattedData="productState.formattedData"
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
          :requestInfo="jokeState.requestInfo"
          :rawResponse="jokeState.rawResponse"
          :apiInfo="jokeApiInfo"
          @fetch="fetchJoke"
          @clear="clearJokeData"
        >
          <template #formatted-data>
            <JokeFormattedColumn
              :formattedData="jokeState.formattedData"
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
          :requestInfo="personState.requestInfo"
          :rawResponse="personState.rawResponse"
          :apiInfo="personApiInfo"
          @fetch="fetchRandomPerson"
          @clear="clearPersonData"
        >
          <template #formatted-data>
            <PersonFormattedColumn
              :formattedData="personState.formattedData"
              :loading="personState.loading"
              :error="personState.error"
            />
          </template>
        </ApiDemoBlock>
      </Tab>
    </Tabs>
  </div>
</template>

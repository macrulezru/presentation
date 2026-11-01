<script setup lang="ts">
  import './airlines.scss';

  import { computed } from 'vue';

  import { gql } from './graphql.js';

  import AirlinesRoute from '@/view/assets/images/airlines/aielines-1.webp';
  import AirlinesGlobe from '@/view/assets/images/airlines/aielines-2.webp';
  import AirlinesHubs from '@/view/assets/images/airlines/aielines-3.webp';
  import airlinesImage from '@/view/assets/images/airlines.webp';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const { locale } = useI18n();
  const config = useRuntimeConfig();

  const POPULAR_AIRLINES = [
    { iata: 'SU', name: 'Aeroflot Russian Airlines', nameRu: 'Аэрофлот' },
    { iata: 'S7', name: 'S7 Airlines', nameRu: 'S7 Airlines' },
    { iata: 'LH', name: 'Lufthansa', nameRu: 'Lufthansa' },
    { iata: 'EK', name: 'Emirates', nameRu: 'Emirates' },
    { iata: 'TK', name: 'Turkish Airlines', nameRu: 'Turkish Airlines' },
    { iata: 'AF', name: 'Air France', nameRu: 'Air France' },
    { iata: 'BA', name: 'British Airways', nameRu: 'British Airways' },
    { iata: 'QR', name: 'Qatar Airways', nameRu: 'Qatar Airways' },
  ];

  type NetworkStats = {
    airlines: number;
    airports: number;
    cities: number;
    routes: number;
  };

  const { data: stats } = await useAsyncData('route-stats', () =>
    fetchRouteStats(config.macrulezApiBase),
  );

  const formatStat = (n: number | undefined) => {
    if (n == null) return '—';
    return new Intl.NumberFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US').format(n);
  };

  const statItems = computed(() => [
    {
      value: formatStat(stats.value?.airlines),
      label: t('airlines.statsAirlines'),
      class: 'airlines',
    },
    {
      value: formatStat(stats.value?.airports),
      label: t('airlines.statsAirports'),
      class: 'airports',
    },
    {
      value: formatStat(stats.value?.routes),
      label: t('airlines.statsRoutes'),
      class: 'routes',
    },
  ]);

  async function fetchRouteStats(apiBase?: string | null): Promise<NetworkStats> {
    const data = await gql<{
      routeStats: {
        totalRoutes: number | null;
        airlines: number | null;
        depAirports: number | null;
        arrAirports: number | null;
      } | null;
      routeStatsByAirline: unknown[] | null;
      cityInitials: Record<string, number> | null;
    }>(
      `query RouteStats {
      routeStats { totalRoutes airlines depAirports arrAirports }
      routeStatsByAirline { airlineIata }
      cityInitials
    }`,
      undefined,
      apiBase,
    );

    const rs = data.routeStats;
    const cityInitials = data.cityInitials ?? {};
    const cities = Object.values(cityInitials).reduce(
      (sum, n) => sum + (Number(n) || 0),
      0,
    );

    return {
      airlines: rs?.airlines ?? data.routeStatsByAirline?.length ?? 0,
      airports: Math.max(rs?.depAirports ?? 0, rs?.arrAirports ?? 0),
      cities,
      routes: rs?.totalRoutes ?? 0,
    };
  }

  interface FeatureItem {
    image: string;
    hash: string;
    title: string;
    text: string;
    link: string;
  }

  interface Features {
    route: FeatureItem;
    globe: FeatureItem;
    hubs: FeatureItem;
  }

  const getRandomAirline = (list = POPULAR_AIRLINES) => {
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('getRandomAirline: airline list is empty or is not an array');
    }
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  };

  const features = computed((): Features => {
    return {
      route: {
        image: AirlinesRoute,
        hash: 'EH_pONwgQjMXy0ZOLFEuMW9-zFAUbYTBmKozWRdpiWHtaW7puG8VluaMQkA',
        title: t('airlines.features.route.title'),
        text: t('airlines.features.route.text'),
        link: 'https://airlines.macrulez.ru/map/2d/catalog',
      },
      globe: {
        image: AirlinesGlobe,
        hash: 'EH_pOOSYSnTzsZJjEImqdXeczHE4xGVmHMmnWITZYGk0EFIcCG45S5mYUA',
        title: t('airlines.features.globe.title'),
        text: t('airlines.features.globe.text'),
        link: `https://airlines.macrulez.ru/map/3d/${getRandomAirline()?.iata}`,
      },
      hubs: {
        image: AirlinesHubs,
        hash: 'EH_ouOQYSnDe4Qt04Jw4rKnJhc08hZJo1iisQ7kYqqWSs1MTMt4VlzV3OIA',
        title: t('airlines.features.hubs.title'),
        text: t('airlines.features.hubs.text'),
        link: 'https://airlines.macrulez.ru/map/2d/airports',
      },
    };
  });
</script>

<template>
  <div class="airlines">
    <div class="airlines__container">
      <div class="airlines__promo">
        <a class="airlines__link" href="https://airlines.macrulez.ru" target="_blank">
          <VImage
            class="airlines__image"
            :src="airlinesImage"
            hazehash="MP_vMvuYQI_gFKbotmOgSmZqt477DcHw9KmRT1n7yGtAzc2EESGGziWdBJCSsA"
            :width="641"
            :height="600"
            :alt="t('airlines.title')"
            :lazy="true"
          />
          <div class="airlines__header">
            {{ t('airlines.title') }}
          </div>
        </a>
        <div class="airlines__description">{{ t('airlines.text') }}</div>
      </div>
      <div class="airlines__stats">
        <div v-for="item in statItems" :key="item.label" class="airlines__stats-item">
          <span
            class="airlines__stats-count"
            :class="`airlines__stats-item_${item.class}`"
          >
            {{ item.value }}
          </span>
          <span class="airlines__stats-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="airlines__features">
        <a
          v-for="(feature, index) in features"
          :key="index"
          :href="feature.link"
          target="_blank"
          class="airlines__feature"
        >
          <VImage
            class="airlines__feature-image"
            :src="feature.image"
            :hazehash="feature.hash"
            :width="400"
            :height="400"
            :alt="feature.title"
            :lazy="true"
          />
          <div class="airlines__feature-info">
            <span class="airlines__feature-title">{{ feature.title }}</span>
            <span class="airlines__feature-description">{{ feature.text }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

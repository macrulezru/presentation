import { PipelineOrchestrator, usePipelineRunVue } from 'rest-pipeline-js';
import stringifyObject from 'stringify-object';
import { ref, computed, type ComputedRef } from 'vue';

import { metricsHandlers } from '@/core/metrics/metrics-bus';
import { DirectionsModel, FlightModel } from '@/models/availability.model';
import { PointsModel, PointModel } from '@/models/points.model';
import { SeatMapModel, SeatModel } from '@/models/seatmap.model';
import { ServicesModel, ServiceModel } from '@/models/services.model';
import { useRequestLogStore } from '@/stores/use-request-log-store';
import PipelineFlight from '@/view/components/pipeline/parts/pipeline-flight/pipeline-flight.vue';
import PipelinePoints from '@/view/components/pipeline/parts/pipeline-points/pipeline-points.vue';
import PipelineResponce from '@/view/components/pipeline/parts/pipeline-responce/pipeline-responce.vue';
import PipelineSeat from '@/view/components/pipeline/parts/pipeline-seat/pipeline-seat.vue';
import PipelineServices from '@/view/components/pipeline/parts/pipeline-services/pipeline-services.vue';
import { useI18n } from '@/view/composables/use-i18n.ts';

// Тип для блока-заглушки
interface PipelineBlock {
  height: number;
}

// Тип для props дополнительных компонентов
interface PointsExtraProps {
  departurePoint: PointModel | null;
  arrivalPoint: PointModel | null;
}
interface FlightExtraProps {
  flight: FlightModel | null;
}
interface ServicesExtraProps {
  services: ServiceModel[] | null;
}
interface SeatExtraProps {
  seat: SeatModel | null;
}

type PipelineStepKey = 'points' | 'availability' | 'services' | 'seatmap';
type PipelineStepStatus = 'pending' | 'success' | 'error' | undefined;

interface PipelineStepBase<K extends PipelineStepKey, ExtraProps> {
  key: K;
  title: ComputedRef<string>;
  blocks: ComputedRef<PipelineBlock[]>;
  status: ComputedRef<PipelineStepStatus>;
  requestUrl: ComputedRef<string>;
  response: ComputedRef<any>;
  responseComponent: any;
  extraComponent: any;
  extraProps: ComputedRef<ExtraProps>;
}

type PipelineStep =
  | PipelineStepBase<'points', PointsExtraProps>
  | PipelineStepBase<'availability', FlightExtraProps>
  | PipelineStepBase<'services', ServicesExtraProps>
  | PipelineStepBase<'seatmap', SeatExtraProps>;

export const usePipeline = () => {
  const { t } = useI18n();

  const pipelineStorage = ref<{
    departurePoint: PointModel | null;
    arrivalPoint: PointModel | null;
    flight: FlightModel | null;
    services: ServiceModel[] | null;
    seat: SeatModel | null;
  }>({
    departurePoint: null,
    arrivalPoint: null,
    flight: null,
    services: null,
    seat: null,
  });

  const isCodeShow = ref(false);

  const pipelineConfig = {
    stages: [
      {
        key: 'points',
        request: async ({ sharedData }: { sharedData: any }) => {
          sharedData.requestUrl = 'points';
          return sharedData.requestUrl;
        },
        after: ({ result, sharedData }: { result: any; sharedData: any }) => {
          const { points } = result;
          if (!Array.isArray(points) || points.length === 0) throw new Error('No points');
          const pointsModel = new PointsModel({ points });
          sharedData.departurePoint = pointsModel.getRandomPoint();
          sharedData.arrivalPoint = pointsModel.findByPointCode(
            sharedData.departurePoint.getRandomDeparture(),
          );
          pipelineStorage.value.departurePoint = sharedData.departurePoint;
          pipelineStorage.value.arrivalPoint = sharedData.arrivalPoint;
          return { ...result, requestUrl: sharedData.requestUrl };
        },
        pauseBefore: 700,
      },
      {
        key: 'availability',
        request: async ({ sharedData }: { sharedData: any }) => {
          sharedData.requestUrl = `availability/${sharedData.departurePoint.code}/${sharedData.arrivalPoint.code}`;
          return sharedData.requestUrl;
        },
        after: ({ result, sharedData }: { result: any; sharedData: any }) => {
          const directionsModel = new DirectionsModel(result);
          sharedData.apiDate = result['api-date'];
          sharedData.flight = directionsModel.directions[0]?.getRandomFlight();
          sharedData.flightNumber = `${sharedData.flight.segments[0].oak}-${sharedData.flight.segments[0].flightNumber}`;
          pipelineStorage.value.flight = sharedData.flight;
          return { ...result, requestUrl: sharedData.requestUrl };
        },
        pauseBefore: 700,
      },
      {
        key: 'services',
        request: async ({ sharedData }: { sharedData: any }) => {
          sharedData.requestUrl = `services/${sharedData.departurePoint.code}/${sharedData.arrivalPoint.code}/${sharedData.apiDate}/${sharedData.flightNumber}`;
          return sharedData.requestUrl;
        },
        after: ({ result, sharedData }: { result: any; sharedData: any }) => {
          const servicesModel = new ServicesModel({ services: result.services || [] });
          pipelineStorage.value.services = servicesModel.getRandomServices();
          return { ...result, requestUrl: sharedData.requestUrl };
        },
        pauseBefore: 700,
      },
      {
        key: 'seatmap',
        request: async ({ sharedData }: { sharedData: any }) => {
          sharedData.requestUrl = `seatmap/${sharedData.apiDate}/${sharedData.flightNumber}`;
          return sharedData.requestUrl;
        },
        after: ({ result, sharedData }: { result: any; sharedData: any }) => {
          const seatMapModel = new SeatMapModel(result);
          pipelineStorage.value.seat = seatMapModel.getRandomAvailableSeat();
          return { ...result, requestUrl: sharedData.requestUrl };
        },
        pauseBefore: 700,
      },
    ],
  };

  const orchestrator = new PipelineOrchestrator({
    config: pipelineConfig,
    httpConfig: {
      baseURL: 'https://api.macrulez.ru/v1/fly',
      timeout: 10000,
      metrics: metricsHandlers,
    },
  });

  const { run, running, stageResults } = usePipelineRunVue(orchestrator);

  const logStore = useRequestLogStore();
  logStore.ensureSubscription();

  const resetting = ref(false);

  const startPipeline = async () => {
    resetting.value = true;
    orchestrator.clearStageResults();
    pipelineStorage.value = {
      departurePoint: null,
      arrivalPoint: null,
      flight: null,
      services: null,
      seat: null,
    };
    await new Promise(r => setTimeout(r, 120));
    resetting.value = false;
    run();
  };

  const pipelineConfigString = stringifyObject(pipelineConfig, {
    indent: '  ',
    singleQuotes: false,
  });

  const triggerShowCode = () => {
    isCodeShow.value = !isCodeShow.value;
  };

  function getStepBlocks(step: string) {
    return computed(() => {
      const status = stageResults.value?.[step]?.status;
      if (status === 'pending') {
        return [{ height: 270 }, { height: 160 }];
      }
      return [{ height: 96 }, { height: 270 }, { height: 160 }];
    });
  }

  const pointsBlocks = getStepBlocks('points');
  const availabilityBlocks = getStepBlocks('availability');
  const servicesBlocks = getStepBlocks('services');
  const seatmapBlocks = getStepBlocks('seatmap');

  const pipelineSteps: PipelineStep[] = [
    {
      key: 'points',
      title: computed(() => t('pipeline-demo.step1')),
      blocks: pointsBlocks,
      status: computed(() => {
        const s = stageResults.value?.points?.status;
        if (s === 'pending' || s === 'success' || s === 'error' || s === undefined)
          return s;
        return undefined;
      }),
      requestUrl: computed(() => stageResults.value?.points?.url || ''),
      response: computed(() => stageResults.value?.points?.data?.points),
      responseComponent: PipelineResponce,
      extraComponent: PipelinePoints,
      extraProps: computed(() => ({
        departurePoint: pipelineStorage.value.departurePoint,
        arrivalPoint: pipelineStorage.value.arrivalPoint,
      })),
    },
    {
      key: 'availability',
      title: computed(() => t('pipeline-demo.step2')),
      blocks: availabilityBlocks,
      status: computed(() => {
        const s = stageResults.value?.availability?.status;
        if (s === 'pending' || s === 'success' || s === 'error' || s === undefined)
          return s;
        return undefined;
      }),
      requestUrl: computed(() => stageResults.value?.availability?.url || ''),
      response: computed(() => stageResults.value?.availability?.data),
      responseComponent: PipelineResponce,
      extraComponent: PipelineFlight,
      extraProps: computed(() => ({
        flight: pipelineStorage.value.flight,
      })),
    },
    {
      key: 'services',
      title: computed(() => t('pipeline-demo.step3')),
      blocks: servicesBlocks,
      status: computed(() => {
        const s = stageResults.value?.services?.status;
        if (s === 'pending' || s === 'success' || s === 'error' || s === undefined)
          return s;
        return undefined;
      }),
      requestUrl: computed(() => stageResults.value?.services?.url || ''),
      response: computed(() => stageResults.value?.services?.data),
      responseComponent: PipelineResponce,
      extraComponent: PipelineServices,
      extraProps: computed(() => ({
        services: pipelineStorage.value.services,
      })),
    },
    {
      key: 'seatmap',
      title: computed(() => t('pipeline-demo.step4')),
      blocks: seatmapBlocks,
      status: computed(() => {
        const s = stageResults.value?.seatmap?.status;
        if (s === 'pending' || s === 'success' || s === 'error' || s === undefined)
          return s;
        return undefined;
      }),
      requestUrl: computed(() => stageResults.value?.seatmap?.url || ''),
      response: computed(() => stageResults.value?.seatmap?.data),
      responseComponent: PipelineResponce,
      extraComponent: PipelineSeat,
      extraProps: computed(() => ({
        seat: pipelineStorage.value.seat,
      })),
    },
  ];

  return {
    pipelineSteps,
    run: startPipeline,
    running,
    resetting,
    pipelineConfigString,
    pipelineStorage,
    stageResults,
    isCodeShow,
    triggerShowCode,
  };
};

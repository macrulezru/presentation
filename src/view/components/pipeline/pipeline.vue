<script setup lang="ts">
  import './pipeline.scss';

  import { onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue';

  import PipelineBoardingPass from './parts/pipeline-boarding-pass/pipeline-boarding-pass.vue';
  import PipelineRequest from './parts/pipeline-request/pipeline-request.vue';
  import PipelineStepPlaceholder from './parts/pipeline-step-placeholder/pipeline-step-placeholder.vue';
  import PipelineStepStatus from './parts/pipeline-step-status/pipeline-step-status.vue';

  import { useMetricStore } from '@/stores/use-metric-store';
import { useI18n } from '~/composables/useI18n';
import { usePipeline } from '@/view/composables/use-pipeline';
import UiButton from '~/components/ui/UiButton.vue';
  import UiColorCode from '@/view/ui/ui-color-code/ui-color-code.vue';
  import UiTumbler from '@/view/ui/ui-tumbler/ui-tumbler.vue';

  const metricStore = useMetricStore();

  const { t } = useI18n();

  const {
    pipelineSteps,
    run,
    running,
    pipelineConfigString,
    isCodeShow,
    triggerShowCode,
    pipelineStorage,
  } = usePipeline();

  const pipelineBlock = ref<HTMLElement | null>(null);

  const setStepDescriptionsEqualHeight = () => {
    if (!pipelineBlock.value) return;

    const nodes = Array.from(
      pipelineBlock.value.querySelectorAll('.pipeline__step-description'),
    ) as HTMLElement[];

    nodes.forEach(node => {
      node.style.height = '';
    });

    let maxHeight = 0;
    nodes.forEach(node => {
      const h = node.offsetHeight;
      if (h > maxHeight) maxHeight = h;
    });

    nodes.forEach(node => {
      node.style.height = `${maxHeight}px`;
    });
  };

  const recalcStepDescriptionsHeight = () => {
    nextTick(() => {
      setStepDescriptionsEqualHeight();
    });
  };

  let resizeHandler: (() => void) | null = null;

  onMounted(() => {
    recalcStepDescriptionsHeight();
    resizeHandler = () => recalcStepDescriptionsHeight();
    window.addEventListener('resize', resizeHandler);
  });

  onBeforeUnmount(() => {
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  });

  watch(
    () => pipelineSteps.map(step => step.status.value),
    (statuses, prevStatuses) => {
      const idx = statuses.findIndex((s, i) => s && !prevStatuses?.[i]);
      if (idx !== -1 && pipelineBlock.value) {
        const stages = pipelineBlock.value.querySelectorAll('.pipeline__stage');
        const el = stages[idx] as HTMLElement;
        if (el) {
          const parent = pipelineBlock.value;
          const elLeft = el.offsetLeft;
          const elRight = elLeft + el.offsetWidth;
          const parentWidth = parent.offsetWidth;
          let scrollLeft;
          if (idx === 0) {
            scrollLeft = 0;
          } else if (el.offsetWidth >= parentWidth || elLeft < parent.scrollLeft) {
            scrollLeft = elLeft;
          } else if (elRight > parent.scrollLeft + parentWidth) {
            scrollLeft = elRight - parentWidth;
          } else {
            const elCenter = elLeft + el.offsetWidth / 2;
            const parentCenter = parentWidth / 2;
            scrollLeft = elCenter - parentCenter;
          }
          parent.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    },
    { deep: true },
  );
</script>

<template>
  <Transition name="content-appear" appear>
    <div class="pipeline">
    <div class="pipeline__container">
      <div class="pipeline__header">
        <div class="pipeline__title">{{ t('pipeline-demo.title') }}</div>
        <div class="pipeline__header-block">
          <div>
            <div class="pipeline__description">
              <div>{{ t('pipeline-demo.intro_problem') }}</div>
              <div>{{ t('pipeline-demo.intro_solution') }}</div>
              <div>{{ t('pipeline-demo.intro_declarative') }}</div>
              <div>{{ t('pipeline-demo.intro_spaghetti') }}</div>
            </div>
          </div>
          <div>
            <div>
              <div class="pipeline__steps-list-title">
                {{ t('pipeline-demo.intro_example') }}
              </div>
              <div class="pipeline__steps-list">
                <div class="pipeline__step-item">
                  <span class="pipeline__step-item-title">
                    {{ t('pipeline-demo.step_route_title') }}
                  </span>
                  <span class="pipeline__step-item-description">
                    {{ t('pipeline-demo.step_route_desc') }}
                  </span>
                </div>
                <div class="pipeline__step-item">
                  <span class="pipeline__step-item-title">
                    {{ t('pipeline-demo.step_flight_title') }}
                  </span>
                  <span class="pipeline__step-item-description">
                    {{ t('pipeline-demo.step_flight_desc') }}
                  </span>
                </div>
                <div class="pipeline__step-item">
                  <span class="pipeline__step-item-title">
                    {{ t('pipeline-demo.step_services_title') }}
                  </span>
                  <span class="pipeline__step-item-description">
                    {{ t('pipeline-demo.step_services_desc') }}
                  </span>
                </div>
                <div class="pipeline__step-item">
                  <span class="pipeline__step-item-title">
                    {{ t('pipeline-demo.step_seat_title') }}
                  </span>
                  <span class="pipeline__step-item-description">
                    {{ t('pipeline-demo.step_seat_desc') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pipeline__links">
          <span class="pipeline__links_show-code-toggle" @click="triggerShowCode">
            {{ t('pipeline-demo.showCode') }}
          </span>
          <a
            class="pipeline__links_github-link"
            href="https://github.com/macrulezru/pipeline-js"
            target="_blank"
            rel="noreferrer"
          >
            {{ t('pipeline-demo.github') }}
          </a>
        </div>
      </div>

      <div class="pipeline__info" :class="{ pipeline__info_visible: isCodeShow }">
        <div class="pipeline__source-code">
          <UiColorCode :code="pipelineConfigString" language="js" />
        </div>
        <div class="pipeline__features-wrapper">
          <div class="pipeline__features">
            <div class="pipeline__feature">
              <div class="pipeline__feature-title">
                {{ t('pipeline-demo.feature1_title') }}
              </div>
              <div class="pipeline__feature-description">
                {{ t('pipeline-demo.feature1_desc') }}
              </div>
            </div>
            <div class="pipeline__feature">
              <div class="pipeline__feature-title">
                {{ t('pipeline-demo.feature2_title') }}
              </div>
              <div class="pipeline__feature-description">
                {{ t('pipeline-demo.feature2_desc') }}
              </div>
            </div>
            <div class="pipeline__feature">
              <div class="pipeline__feature-title">
                {{ t('pipeline-demo.feature3_title') }}
              </div>
              <div class="pipeline__feature-description">
                {{ t('pipeline-demo.feature3_desc') }}
              </div>
            </div>
            <div class="pipeline__feature">
              <div class="pipeline__feature-title">
                {{ t('pipeline-demo.feature4_title') }}
              </div>
              <div class="pipeline__feature-description">
                {{ t('pipeline-demo.feature4_desc') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pipeline__demo-block">
        <div class="pipeline__metrics-toggle-block">
          <div>{{ t('pipeline-demo.metrics_show') }}</div>
          <div>
            <UiTumbler
              :active="metricStore.isShowMetric"
              @toggle="metricStore.setShowStatus(!metricStore.isShowMetric)"
            />
          </div>
          <div class="pipeline__metrics-toggle-block-shortcut">Shift + ~</div>
        </div>
        <div class="pipeline__start-pipeline">
          <UiButton
            :disabled="running"
            :text="t('pipeline-demo.runButton')"
            @click="run"
          />
        </div>
        <div ref="pipelineBlock" class="pipeline__out">
          <div
            v-for="(step, index) in pipelineSteps"
            :key="step.key"
            class="pipeline__stage"
          >
            <div class="pipeline__step-description">{{ step.title }}</div>
            <PipelineStepStatus
              :status="step.status.value"
              :label="index + 1"
              :isLast="index === pipelineSteps.length - 1"
            />
            <div v-if="step.status.value">
              <PipelineRequest :url="step.requestUrl.value" />
            </div>
            <PipelineStepPlaceholder
              v-if="step.status.value !== 'success'"
              :blocks="step.blocks.value"
            />
            <template v-if="step.status.value === 'success'">
              <div>
                <component :is="step.responseComponent" :data="step.response.value" />
              </div>
              <div v-if="step.extraComponent">
                <component :is="step.extraComponent" v-bind="step.extraProps.value" />
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="pipeline__boarding">
        <Transition name="pipeline-fade">
          <PipelineBoardingPass
            v-if="pipelineSteps.every(step => step.status.value === 'success')"
            :pipelineStorage="pipelineStorage"
          />
        </Transition>
      </div>
    </div>
  </div>
  </Transition>
</template>

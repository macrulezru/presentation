export const METRICS_PANEL_TOGGLE_EVENT = 'metrics-panel:toggle';
export const METRICS_PANEL_SHORTCUT = 'Shift + ~';
export const METRICS_PANEL_STATE_EVENT = 'metrics-panel:state';

export type MetricsPanelToggleDetail = {
  open?: boolean;
};

export function emitMetricsPanelToggle(open?: boolean): void {
  window.dispatchEvent(
    new CustomEvent<MetricsPanelToggleDetail>(METRICS_PANEL_TOGGLE_EVENT, {
      detail: { open },
    }),
  );
}

export function emitMetricsPanelState(open: boolean): void {
  window.dispatchEvent(
    new CustomEvent<MetricsPanelToggleDetail>(METRICS_PANEL_STATE_EVENT, {
      detail: { open },
    }),
  );
}

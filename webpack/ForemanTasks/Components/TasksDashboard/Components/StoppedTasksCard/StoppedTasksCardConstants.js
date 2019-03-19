export const STOPPED_TASK_CARD_FOCUSED_ON_OPTIONS = {
  NORMAL: 'normal', // normal-mode
  STOPPED_TOTAL: 'stopped-total', // total-mode,
  ERROR_TOTAL: 'stopped-total-error', // error total-mode
  ERROR_LAST: 'stopped-last-error', // error last X mode
  WARNING_TOTAL: 'stopped-total-warning', // warning total-mode
  WARNING_LAST: 'stopped-last-warning', // warning last X mode
  SUCCESS_TOTAL: 'stopped-total-success', // success total-mode
  SUCCESS_LAST: 'stopped-last-success', // success last X mode
  NONE: 'none', // unfocus-mode: another card is selected
};

export const STOPPED_TASK_CARD_FOCUSED_ON_OPTIONS_ARRAY = Object.values(
  STOPPED_TASK_CARD_FOCUSED_ON_OPTIONS
);

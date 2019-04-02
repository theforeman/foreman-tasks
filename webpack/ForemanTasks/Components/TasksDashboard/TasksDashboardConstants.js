import { translate as __ } from 'foremanReact/common/I18n';

export const TASKS_DASHBOARD_AVAILABLE_QUERY_STATES = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  SCHEDULED: 'scheduled',
};

export const TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
};

export const TASKS_DASHBOARD_AVAILABLE_QUERY_MODES = {
  LAST: 'last',
  OLDER: 'older',
};

export const TASKS_DASHBOARD_AVAILABLE_TIMES = {
  H24: 'H24',
  H12: 'H12',
  WEEK: 'WEEK',
};

export const TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT = {
  [TASKS_DASHBOARD_AVAILABLE_TIMES.H24]: __('24h'),
  [TASKS_DASHBOARD_AVAILABLE_TIMES.H12]: __('12h'),
  [TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK]: __('week'),
};

export const TASKS_DASHBOARD_CURRENT_TIME = 'TASKS_DASHBOARD_CURRENT_TIME';

export const FOREMAN_TASKS_DASHBOARD_INIT = 'FOREMAN_TASKS_DASHBOARD_INIT';

export const FOREMAN_TASKS_DASHBOARD_UPDATE_TIME =
  'FOREMAN_TASKS_DASHBOARD_UPDATE_TIME';

export const FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY =
  'FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY';

export const FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST =
  'FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST';
export const FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS =
  'FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS';
export const FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE =
  'FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE';

export const TASKS_SUMMARY_ZERO = {
  running: {
    recent: 0,
    total: 0,
  },
  paused: {
    recent: 0,
    total: 0,
  },
  stopped: {
    by_result: {
      error: {
        total: 0,
        recent: 0,
      },
      warning: {
        total: 0,
        recent: 0,
      },
      success: {
        total: 0,
        recent: 0,
      },
    },
  },
  scheduled: {
    total: 0,
  },
};

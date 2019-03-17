import { translate as __ } from 'foremanReact/common/I18n';

export const TASKS_SUMMARY_REQUEST = 'TASKS_SUMMARY_REQUEST';
export const TASKS_SUMMARY_SUCCESS = 'TASKS_SUMMARY_SUCCESS';
export const TASKS_SUMMARY_FAILURE = 'TASKS_SUMMARY_FAILURE';

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

export const STATUS = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  ERROR: 'ERROR',
};

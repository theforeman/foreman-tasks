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

export const MOCKED_DATA = {
  running: {
    last: 3,
    older: 5,
  },
  paused: {
    last: 3,
    older: 5,
  },
  stopped: {
    error: {
      total: 8,
      last: 1,
    },
    warning: {
      total: 20,
      last: 2,
    },
    success: {
      total: 25,
      last: 3,
    },
  },
  scheduled: 1,
};

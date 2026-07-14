import { getURIQuery } from 'foremanReact/common/helpers';

import {
  HOURS_PER_HALF_DAY,
  HOURS_PER_DAY,
  DAYS_PER_WEEK,
} from 'foremanReact/constants';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_QUERY_KEYS_TEXT,
  TASKS_DASHBOARD_QUERY_VALUES_TEXT,
  TASKS_DASHBOARD_JS_QUERY_MODES,
} from './TasksDashboardConstants';
import { updateURlQuery } from '../TasksTable/TasksTableHelpers';

export const getQueryKeyText = key => TASKS_DASHBOARD_QUERY_KEYS_TEXT[key];

export const getQueryValueText = value =>
  TASKS_DASHBOARD_QUERY_VALUES_TEXT[value];

export const timeToHoursNumber = time => {
  switch (time) {
    case TASKS_DASHBOARD_AVAILABLE_TIMES.H12:
      return HOURS_PER_HALF_DAY;
    case TASKS_DASHBOARD_AVAILABLE_TIMES.H24:
      return HOURS_PER_DAY;
    case TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK:
      return HOURS_PER_DAY * DAYS_PER_WEEK;
    default:
      return HOURS_PER_DAY;
  }
};

const uriToQueryMap = {
  state: 'state',
  result: 'result',
  time_mode: 'mode',
  time_horizon: 'time',
};

const queryFromUriQuery = uriQuery => {
  const query = {};

  Object.entries(uriToQueryMap).forEach(([uriField, queryField]) => {
    if (uriQuery[uriField]) query[queryField] = uriQuery[uriField];
  });

  if (query.mode === TASKS_DASHBOARD_JS_QUERY_MODES.RECENT) {
    query.mode = TASKS_DASHBOARD_QUERY_VALUES_TEXT.LAST;
  }

  return query;
};

export const getQueryFromUrl = () => {
  const uriQuery = getURIQuery(window.location.href);

  return queryFromUriQuery(uriQuery);
};

export const resolveQuery = ({ state, result, mode, time }, history) => {
  const uriQuery = {
    state,
    result,
    time_mode: mode === 'last' ? 'recent' : mode,
    time_horizon: time,
    page: 1,
  };
  updateURlQuery(uriQuery, history);
};

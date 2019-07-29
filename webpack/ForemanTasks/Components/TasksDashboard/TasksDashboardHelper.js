import { getURIQuery } from 'foremanReact/common/helpers';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_QUERY_KEYS_TEXT,
  TASKS_DASHBOARD_QUERY_VALUES_TEXT,
} from './TasksDashboardConstants';
import { updateURlQuery } from '../TasksTable/TasksTableHelpers';

export const getQueryKeyText = key => TASKS_DASHBOARD_QUERY_KEYS_TEXT[key];

export const getQueryValueText = value =>
  TASKS_DASHBOARD_QUERY_VALUES_TEXT[value];

export const timeToHoursNumber = time => {
  switch (time) {
    case TASKS_DASHBOARD_AVAILABLE_TIMES.H12:
      return 12;
    case TASKS_DASHBOARD_AVAILABLE_TIMES.H24:
      return 24;
    case TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK:
      return 24 * 7;
    default:
      return 24;
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

  if (query.mode === 'recent') {
    query.mode = 'last';
  }

  return query;
};

export const getQueryFromUrl = () => {
  const uriQuery = getURIQuery(window.location.href);

  return queryFromUriQuery(uriQuery);
};

export const updateURLQuery = ({ state, result, mode, time, uri }) => {
  const query = {
    state,
    result,
    time_mode: mode === 'last' ? 'recent' : mode,
    time_horizon: time,
    page: 1,
  };

  uri.setSearch(query);
  window.history.pushState({ path: uri.toString() }, '', uri.toString());
};

export const resolveQuery = query => {
  if (query.mode === 'last') {
    query.mode = 'recent';
  }
  const uriQuery = {
    state: query.state,
    result: query.result,
    time_mode: query.mode,
    time_horizon: query.time,
    page: 1,
    per_page: 20,
  };
  updateURlQuery(uriQuery);
};

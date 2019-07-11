import URI from 'urijs';
import { getURIQuery } from 'foremanReact/common/helpers';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_QUERY_KEYS_TEXT,
  TASKS_DASHBOARD_QUERY_VALUES_TEXT,
} from './TasksDashboardConstants';

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

const uriQueryFromQuery = query => {
  const uriQuery = {};

  Object.entries(uriToQueryMap).forEach(([uriField, queryField]) => {
    if (query[queryField]) uriQuery[uriField] = query[queryField];
  });

  if (uriQuery.time_mode === 'last') {
    uriQuery.time_mode = 'recent';
  }

  return uriQuery;
};

export const getQueryFromUrl = () => {
  const uriQuery = getURIQuery(window.location.href);

  return queryFromUriQuery(uriQuery);
};

export const resolveQuery = query => {
  const uriQuery = uriQueryFromQuery(query);

  const uri = new URI(window.location.href);
  const { search } = uri.query(true);

  const data = { search, ...uriQuery, page: 1 };
  const { $, tfm } = window;

  uri.query(URI.buildQuery(data, true));
  tfm.tools.showSpinner();
  $.ajax({
    type: 'get',
    url: uri.toString(),
    success(result) {
      const res = $(`<div>${result}</div>`);

      $('#tasks-table').html(res.find('#tasks-table'));
    },
    error({ statusText }) {
      $('#tasks-table').html(statusText);
    },
    complete(result) {
      tfm.tools.hideSpinner();
    },
  });
};

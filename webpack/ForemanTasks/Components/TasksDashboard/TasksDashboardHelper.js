import URI from 'urijs';
import { getURIQuery } from 'foremanReact/common/helpers';

import { TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT } from './TasksDashboardConstants';

export const getTimeText = time => TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT[time];

export const getQueryFromUrl = () => {
  const query = {};
  const uriQuery = getURIQuery(window.location.href);

  ['state', 'result', 'mode', 'time'].forEach(f => {
    if (uriQuery[f]) query[f] = uriQuery[f];
  });

  return query;
};

export const resolveQuery = query => {
  const uri = new URI(window.location.href);
  const { search } = uri.query(true);

  const data = { search, ...query, page: 1 };
  uri.query(URI.buildQuery(data, true));
  window.Turbolinks.visit(uri.toString());
};

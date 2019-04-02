import URI from 'urijs';
import { getURIQuery } from 'foremanReact/common/helpers';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT,
} from './TasksDashboardConstants';

export const getTimeText = time => TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT[time];

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

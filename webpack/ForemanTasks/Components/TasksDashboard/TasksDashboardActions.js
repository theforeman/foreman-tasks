import { resolveSearchQuery } from 'foremanReact/components/SearchBar/SearchBarHelpers';

import { createSearchQueryByType } from './TasksDashboardHelper';
import {
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
  FOREMAN_TASKS_DASHBOARD_UPDATE_SEARCH_QUERY,
} from './TasksDashboardConstants';

export const updateTimePeriod = timePeriod => ({
  type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
  payload: timePeriod,
});

export const updateSearchQuery = (types, timePeriod) => dispatch => {
  const searchQuery = types
    .map(type => createSearchQueryByType(type, timePeriod))
    .join(' and ');

  dispatch({
    type: FOREMAN_TASKS_DASHBOARD_UPDATE_SEARCH_QUERY,
    payload: searchQuery,
  });

  resolveSearchQuery(searchQuery);
};

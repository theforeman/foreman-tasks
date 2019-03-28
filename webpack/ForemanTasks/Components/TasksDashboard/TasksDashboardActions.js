import { resolveQuery } from './TasksDashboardHelper';
import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  TASKS_DASHBOARD_CURRENT_TIME,
} from './TasksDashboardConstants';
import { selectTime } from './TasksDashboardSelectors';

export const initializeDashboard = ({ time, query }) => ({
  type: FOREMAN_TASKS_DASHBOARD_INIT,
  payload: { time, query },
});

export const updateTime = time => ({
  type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  payload: time,
});

export const updateQuery = query => (dispatch, getState) => {
  if (query.time === TASKS_DASHBOARD_CURRENT_TIME)
    query.time = selectTime(getState());

  dispatch({
    type: FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
    payload: query,
  });

  resolveQuery(query);
};

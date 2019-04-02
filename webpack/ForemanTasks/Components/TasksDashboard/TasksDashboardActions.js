import API from 'foremanReact/API';
import { timeToHoursNumber, resolveQuery } from './TasksDashboardHelper';
import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  TASKS_DASHBOARD_CURRENT_TIME,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
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

export const fetchTasksSummary = time => async dispatch => {
  try {
    dispatch(startRequest());

    const hours = timeToHoursNumber(time);

    const { data } = await API.get(`/foreman_tasks/tasks/summary/${hours}`);

    return dispatch(requestSuccess(data));
  } catch (error) {
    return dispatch(requestFailure(error));
  }
};

const startRequest = () => ({
  type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
});

const requestSuccess = data => ({
  type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  payload: data,
});

const requestFailure = error => ({
  type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
  payload: error,
});

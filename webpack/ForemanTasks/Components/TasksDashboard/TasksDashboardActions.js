import API from 'foremanReact/API';
import {
  TASKS_SUMMARY_FAILURE,
  TASKS_SUMMARY_REQUEST,
  TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
  STATUS,
} from './TasksDashboardConstants';

export const updateTimePeriod = timePeriod => ({
  type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
  payload: timePeriod,
});

export const getTasksSummary = () => dispatch => {
  dispatch(startRequest());
  return createAPIRequest({ dispatch });
};
const startRequest = () => ({
  type: TASKS_SUMMARY_REQUEST,
  payload: {
    status: STATUS.PENDING,
  },
});
const createAPIRequest = ({ dispatch }) =>
  API.get('/foreman_tasks/tasks/summary/24')
    .then(({ data }) =>
      dispatch(
        requestSuccess({
          data,
        })
      )
    )
    .catch(error => dispatch(requestFailure({ error })));

const requestFailure = ({ error }) => ({
  type: TASKS_SUMMARY_FAILURE,
  payload: {
    results: [],
    error: error.message || error,
    status: STATUS.ERROR,
  },
});

const requestSuccess = ({ data }) => ({
  type: TASKS_SUMMARY_SUCCESS,
  payload: {
    ...data,
  },
});

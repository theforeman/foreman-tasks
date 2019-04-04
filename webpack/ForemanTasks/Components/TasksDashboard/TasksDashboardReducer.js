import Immutable from 'seamless-immutable';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
  TASKS_SUMMARY_ZERO,
} from './TasksDashboardConstants';

const initialState = Immutable({
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
  isLoadingTasksSummary: false,
  error: null,
  tasksSummary: TASKS_SUMMARY_ZERO,
});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FOREMAN_TASKS_DASHBOARD_INIT:
      return state
        .set('time', (payload && payload.time) || initialState.time)
        .set('query', (payload && payload.query) || initialState.query);
    case FOREMAN_TASKS_DASHBOARD_UPDATE_TIME:
      return state.set('time', payload);
    case FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY:
      return state.set('query', payload);
    case FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST:
      return state.set('isLoading', true);
    case FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS:
      return state.merge({
        tasksSummary: payload,
        isLoading: false,
        error: null,
      });
    case FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE:
      return state.merge({
        tasksSummary: TASKS_SUMMARY_ZERO,
        isLoading: false,
        error: payload,
      });
    default:
      return state;
  }
};

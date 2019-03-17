import Immutable from 'seamless-immutable';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
  TASKS_SUMMARY_SUCCESS,
  TASKS_SUMMARY_REQUEST,
  TASKS_SUMMARY_ZERO,
} from './TasksDashboardConstants';

const initialState = Immutable({
  timePeriod: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  tasksSummary: TASKS_SUMMARY_ZERO,
});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD:
      return state.set('timePeriod', payload);
    case TASKS_SUMMARY_SUCCESS:
      return state.set('tasksSummary', payload).set('isLoading', false);
    case TASKS_SUMMARY_REQUEST:
      return state.set('isLoading', true);
    default:
      return state;
  }
};

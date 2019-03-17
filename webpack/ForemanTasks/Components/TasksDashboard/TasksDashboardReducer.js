import Immutable from 'seamless-immutable';
import {
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD,
} from './TasksDashboardConstants';

const initialState = Immutable({
  timePeriod: TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H24,
});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FOREMAN_TASKS_DASHBOARD_UPDATE_TIME_PERIOD:
      return state.set('timePeriod', payload);
    default:
      return state;
  }
};

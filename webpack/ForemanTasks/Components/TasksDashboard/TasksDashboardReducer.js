import Immutable from 'seamless-immutable';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
} from './TasksDashboardConstants';

const initialState = Immutable({
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FOREMAN_TASKS_DASHBOARD_INIT:
      return state
        .set('time', payload.time || initialState.time)
        .set('query', payload.query || initialState.query);
    case FOREMAN_TASKS_DASHBOARD_UPDATE_TIME:
      return state.set('time', payload);
    case FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY:
      return state.set('query', payload);
    default:
      return state;
  }
};

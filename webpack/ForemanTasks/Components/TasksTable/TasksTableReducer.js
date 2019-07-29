import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import { createTableReducer } from 'foremanReact/components/common/table';
import {
  TASKS_TABLE_CONTROLLER,
  TASKS_TABLE_REQUEST,
  TASKS_TABLE_SUCCESS,
  TASKS_TABLE_FAILURE,
} from './TasksTableConstants';
import { FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY } from '../TasksDashboard/TasksDashboardConstants';

const initialState = Immutable({
  query: null,
  loading: true,
  itemCount: 0,
  pagination: {
    page: 1,
    perPage: 20,
  },
});

export const TasksTableQueryReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case TASKS_TABLE_REQUEST:
      return state.set('loading', true);
    case TASKS_TABLE_FAILURE:
      return state.set('loading', true);
    case TASKS_TABLE_SUCCESS:
      return Immutable.merge(state, {
        loading: false,
        itemCount: payload.subtotal,
        pagination: {
          page: parseInt(payload.page, 10),
          perPage: parseInt(payload.per_page, 10),
        },
      });
    case FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY:
      if (payload.mode === 'last') {
        payload.mode = 'recent';
      }
      return state.set('query', payload);
    default:
      return state;
  }
};
export default combineReducers({
  tasksTableContent: createTableReducer(TASKS_TABLE_CONTROLLER),
  tasksTableQuery: TasksTableQueryReducer,
});

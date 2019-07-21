import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import { createTableReducer } from 'foremanReact/components/common/table';
import {
  TASKS_TABLE_CONTROLLER,
  TASKS_TABLE_SUCCESS,
  TASKS_TABLE_PENDING,
} from './TasksTableConstants';

const initState = Immutable({
  loading: true,
  itemCount: 0,
  pagination: {
    page: 1,
    perPage: 10,
  },
});

export const TasksTablePaginationReducer = (state = initState, action) => {
  switch (action.type) {
    case TASKS_TABLE_PENDING:
      return state.set('loading', true);
    case TASKS_TABLE_SUCCESS:
      return Immutable.merge(state, {
        loading: false,
        itemCount: action.payload.subtotal,
        pagination: {
          page: parseInt(action.payload.page, 10),
          perPage: parseInt(action.payload.per_page, 10),
        },
      });
    default:
      return state;
  }
};
export default combineReducers({
  tasksTableContent: createTableReducer(TASKS_TABLE_CONTROLLER),
  tasksTablePagination: TasksTablePaginationReducer,
});

import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import { createTableReducer } from 'foremanReact/components/common/table';
import createTableActionTypes from 'foremanReact/components/common/table/actionsHelpers/actionTypeCreator';
import {
  TASKS_TABLE_ID,
  TASKS_TABLE_SET_SORT,
  TASKS_TABLE_SET_PAGINATION,
} from './TasksTableConstants';

export const TasksTableQueryReducer = (state = {}, action) => {
  const {
    type,
    payload: {
      subtotal,
      page,
      per_page: perPageString,
      by,
      order,
      perPage,
      action_name: actionName,
    } = {},
  } = action;
  const ACTION_TYPES = createTableActionTypes(TASKS_TABLE_ID);
  switch (type) {
    case ACTION_TYPES.SUCCESS:
      return Immutable.merge(state, {
        itemCount: subtotal,
        actionName,
        pagination: {
          page: Number(page),
          perPage: Number(perPageString),
        },
      });
    case TASKS_TABLE_SET_SORT:
      return Immutable.merge(state, {
        sort: {
          by,
          order,
        },
      });
    case TASKS_TABLE_SET_PAGINATION:
      return Immutable.merge(state, {
        pagination: {
          page,
          perPage,
        },
      });

    default:
      return state;
  }
};
export default combineReducers({
  tasksTableContent: createTableReducer(TASKS_TABLE_ID),
  tasksTableQuery: TasksTableQueryReducer,
});

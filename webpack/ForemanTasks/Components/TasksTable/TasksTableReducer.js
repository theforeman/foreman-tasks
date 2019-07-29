import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import { createTableReducer } from 'foremanReact/components/common/table';
import createTableActionTypes from 'foremanReact/components/common/table/actionsHelpers/actionTypeCreator';
import { TASKS_TABLE_ID } from './TasksTableConstants';

export const TasksTableQueryReducer = (state = {}, action) => {
  const {
    type,
    payload: {
      subtotal,
      page,
      per_page: perPageString,
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
    default:
      return state;
  }
};
export default combineReducers({
  tasksTableContent: createTableReducer(TASKS_TABLE_ID),
  tasksTableQuery: TasksTableQueryReducer,
});

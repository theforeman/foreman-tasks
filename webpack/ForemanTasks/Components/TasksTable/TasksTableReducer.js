import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import { union } from 'lodash';
import { createTableReducer } from 'foremanReact/components/common/table';
import createTableActionTypes from 'foremanReact/components/common/table/actionsHelpers/actionTypeCreator';
import {
  TASKS_TABLE_ID,
  SELECT_ROWS,
  UNSELECT_ROWS,
  UNSELECT_ALL_ROWS,
  UPDATE_CLICKED,
  SELECT_ALL_ROWS,
  OPEN_SELECT_ALL,
} from './TasksTableConstants';

const initialState = Immutable({
  selectedRows: [],
});

export const TasksTableQueryReducer = (state = initialState, action) => {
  const { type, payload, response } = action;
  const {
    subtotal,
    page,
    per_page: perPageString,
    action_name: actionName,
    can_edit: canEdit,
  } = response || {};
  const ACTION_TYPES = createTableActionTypes(TASKS_TABLE_ID);
  switch (type) {
    case SELECT_ALL_ROWS:
      return state.set('allRowsSelected', true);
    case ACTION_TYPES.SUCCESS:
      return Immutable.merge(state, {
        itemCount: subtotal,
        actionName,
        pagination: {
          page: Number(page),
          perPage: Number(perPageString),
        },
        selectedRows: [],
        permissions: {
          edit: canEdit,
        },
      });
    case SELECT_ROWS:
      return state.set('selectedRows', union(payload, state.selectedRows));
    case OPEN_SELECT_ALL:
      return state.set('showSelectAll', true);
    case UNSELECT_ROWS:
      return state
        .set(
          'selectedRows',
          state.selectedRows.filter(row => row !== payload.id)
        )
        .set('showSelectAll', false)
        .set('allRowsSelected', false);
    case UNSELECT_ALL_ROWS:
      return state
        .set('selectedRows', [])
        .set('allRowsSelected', false)
        .set('showSelectAll', false);
    case UPDATE_CLICKED:
      return state.set('clicked', payload.clicked);
    default:
      return state;
  }
};
export default combineReducers({
  tasksTableContent: createTableReducer(TASKS_TABLE_ID),
  tasksTableQuery: TasksTableQueryReducer,
});

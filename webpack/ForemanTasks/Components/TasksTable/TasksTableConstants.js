import { getControllerSearchProps } from 'foremanReact/constants';

export const TASKS_TABLE_ID = 'TASKS_TABLE';
export const TASKS_CONTROLLER = 'tasks';
export const TASKS_SUCCESS = 'TASKS_SUCCESS';
export const TASKS_REQUEST = 'TASKS_REQUEST';
export const TASKS_FAILURE = 'TASKS_FAILURE';
export const SELECT_ROWS = 'SELECT_ROWS';
export const UNSELECT_ROWS = 'UNSELECT_ROWS';
export const UNSELECT_ALL_ROWS = 'UNSELECT_ALL_ROWS';

export const TASKS_TABLE_SHOW_CANCEL_ALL_MODAL =
  'TASKS_TABLE_SHOW_CANCEL_ALL_MODAL';
export const TASKS_TABLE_HIDE_CANCEL_ALL_MODAL =
  'TASKS_TABLE_HIDE_CANCEL_ALL_MODAL';
export const TASKS_SEARCH_PROPS = getControllerSearchProps('tasks');

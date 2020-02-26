import { getControllerSearchProps } from 'foremanReact/constants';

export const TASKS_TABLE_ID = 'TASKS_TABLE';
export const SELECT_ROWS = 'SELECT_ROWS';
export const UNSELECT_ROWS = 'UNSELECT_ROWS';
export const UNSELECT_ALL_ROWS = 'UNSELECT_ALL_ROWS';
export const CANCEL = 'CANCEL';
export const RESUME = 'RESUME';
export const CLOSED = 'CLOSED';

export const TASKS_TABLE_SELECTED_MODAL = 'TASKS_TABLE_SELECTED_MODAL';
export const TASKS_SEARCH_PROPS = {
  ...getControllerSearchProps('tasks'),
  controller: 'foreman_tasks/tasks'
};

import { getControllerSearchProps } from 'foremanReact/constants';

export const TASKS_TABLE_ID = 'TASKS_TABLE';
export const SELECT_ROWS = 'SELECT_ROWS';
export const UNSELECT_ROWS = 'UNSELECT_ROWS';
export const UNSELECT_ALL_ROWS = 'UNSELECT_ALL_ROWS';
export const TASKS_RESUME_REQUEST = 'TASKS_RESUME_REQUEST';
export const TASKS_RESUME_SUCCESS = 'TASKS_RESUME_SUCCESS';
export const TASKS_RESUME_FAILURE = 'TASKS_RESUME_FAILURE';
export const TASKS_CANCEL_REQUEST = 'TASKS_CANCEL_REQUEST';
export const TASKS_CANCEL_SUCCESS = 'TASKS_CANCEL_SUCCESS';
export const TASKS_CANCEL_FAILURE = 'TASKS_CANCEL_FAILURE';

export const CANCEL_MODAL = 'cancelConfirmModal';
export const RESUME_MODAL = 'resumeConfirmModal';
export const CANCEL_SELECTED_MODAL = 'cancelSelectedConfirmModal';
export const RESUME_SELECTED_MODAL = 'resumeSelectedConfirmModal';
export const CONFIRM_MODAL = 'ConfirmModal';

export const UPDATE_CLICKED = 'UPDATE_CLICKED';
export const UPDATE_MODAL = 'UPDATE_MODAL';

export const TASKS_SEARCH_PROPS = {
  ...getControllerSearchProps('tasks'),
  controller: 'foreman_tasks/tasks',
};

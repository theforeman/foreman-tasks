import { getControllerSearchProps } from 'foremanReact/constants';

export const TASKS_TABLE_ID = 'TASKS_TABLE';

export const SELECT_ROWS = 'SELECT_ROWS';
export const UNSELECT_ROWS = 'UNSELECT_ROWS';
export const UNSELECT_ALL_ROWS = 'UNSELECT_ALL_ROWS';
export const SELECT_ALL_ROWS = 'SELECT_ALL_ROWS';
export const OPEN_SELECT_ALL = 'OPEN_SELECT_ALL';

export const BULK_CANCEL_PATH = 'bulk_cancel';
export const BULK_RESUME_PATH = 'bulk_resume';

export const CANCEL_CONFIRM_MODAL_ID = 'cancelConfirmModal';
export const RESUME_CONFIRM_MODAL_ID = 'resumeConfirmModal';
export const CANCEL_SELECTED_CONFIRM_MODAL_ID = 'cancelSelectedConfirmModal';
export const RESUME_SELECTED_CONFIRM_MODAL_ID = 'resumeSelectedConfirmModal';
export const UPDATE_CLICKED = 'UPDATE_CLICKED';

export const TASKS_SEARCH_PROPS = {
  ...getControllerSearchProps('tasks'),
  controller: 'foreman_tasks/tasks',
};

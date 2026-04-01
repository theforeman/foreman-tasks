import { getControllerSearchProps } from 'foremanReact/constants';

export const BULK_CANCEL_PATH = 'bulk_cancel';
export const BULK_RESUME_PATH = 'bulk_resume';
export const BULK_FORCE_CANCEL_PATH = 'bulk_stop';

export const TASKS_SEARCH_PROPS = {
  ...getControllerSearchProps('tasks'),
  controller: 'foreman_tasks_tasks',
};

export const TASKS_API_KEY = 'tasks_table';

export const CANCEL_MODAL = 'cancel';
export const RESUME_MODAL = 'resume';
export const FORCE_UNLOCK_MODAL = 'force_unlock';

export const CANCEL_SELECTED_MODAL = 'cancelSelectedConfirmModal';
export const RESUME_SELECTED_MODAL = 'resumeSelectedConfirmModal';
export const FORCE_UNLOCK_SELECTED_MODAL = 'forceUnlockSelectedConfirmModal';

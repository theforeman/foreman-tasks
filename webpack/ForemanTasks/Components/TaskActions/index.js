import { translate as __ } from 'foremanReact/common/I18n';
import API from 'foremanReact/API';
import {
  FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
  FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
} from './TaskActionsConstants';
import { TOAST_TYPES } from '../common/ToastTypesConstants';
import { dispatchToast } from '../common/ToastHelpers';

export const toggleUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
});
export const toggleForceUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
});

export const resumeTaskRequest = (id, name) => async dispatch => {
  try {
    await API.post(`/foreman_tasks/tasks/${id}/resume`);
    dispatchToast(dispatch, {
      type: TOAST_TYPES.SUCCESS,
      message: __(`"${name}" ${__('Task execution was resumed')}`),
    });
  } catch ({ response }) {
    dispatchToast(dispatch, {
      type: TOAST_TYPES.ERROR,
      message: __(`Task "${name}" has to be resumable.`),
    });
  }
};

export const cancelTaskRequest = (id, name) => async dispatch => {
  dispatchToast(dispatch, {
    type: TOAST_TYPES.INFO,
    message: `${__('Trying to cancel')} "${name}" ${__('task')}`,
  });
  try {
    await API.post(`/foreman_tasks/tasks/${id}/cancel`);
    dispatchToast(dispatch, {
      type: TOAST_TYPES.SUCCESS,
      message: `"${name}" ${__('Task cancelled')}`,
    });
  } catch ({ response }) {
    dispatchToast(dispatch, {
      type: TOAST_TYPES.ERROR,
      message: `"${name}" ${__('Task cannot be cancelled at the moment.')}`,
    });
  }
};

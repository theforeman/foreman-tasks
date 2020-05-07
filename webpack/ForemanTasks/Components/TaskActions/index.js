import { sprintf } from 'foremanReact/common/I18n';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import {
  FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
  FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_CANCEL_FAILURE,
} from './TaskActionsConstants';
import { TOAST_TYPES } from '../common/ToastTypesConstants';
import {
  resumeToastInfo,
  cancelToastInfo,
  toastDispatch,
} from './TaskActionHelpers';

export const toggleUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
});
export const toggleForceUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
});

export const cancelTaskRequest = (id, name) => async dispatch => {
  dispatch(
    addToast({
      type: TOAST_TYPES.INFO,
      message: sprintf('Trying to cancel %s task', name),
    })
  );
  dispatch({ type: TASKS_CANCEL_REQUEST });
  try {
    await API.post(`/foreman_tasks/tasks/${id}/cancel`);
    dispatch({ type: TASKS_CANCEL_SUCCESS });
    toastDispatch({
      type: 'cancelled',
      name,
      toastInfo: cancelToastInfo,
      dispatch,
    });
  } catch (error) {
    dispatch({ type: TASKS_CANCEL_FAILURE, payload: error });
    toastDispatch({
      type: 'skipped',
      name,
      toastInfo: cancelToastInfo,
      dispatch,
    });
  }
};

export const resumeTaskRequest = (id, name) => async dispatch => {
  dispatch({ type: TASKS_RESUME_REQUEST });
  try {
    await API.post(`/foreman_tasks/tasks/${id}/resume`);

    dispatch({ type: TASKS_RESUME_SUCCESS });
    toastDispatch({
      type: 'resumed',
      name,
      toastInfo: resumeToastInfo,
      dispatch,
    });
  } catch (error) {
    dispatch({ type: TASKS_RESUME_FAILURE, payload: error });
    toastDispatch({
      type: 'failed',
      name,
      toastInfo: resumeToastInfo,
      dispatch,
    });
  }
};

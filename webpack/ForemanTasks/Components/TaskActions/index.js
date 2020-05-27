import { sprintf } from 'foremanReact/common/I18n';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import {
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_CANCEL_FAILURE,
  TASKS_FORCE_CANCEL_REQUEST,
  TASKS_FORCE_CANCEL_SUCCESS,
  TASKS_FORCE_CANCEL_FAILURE,
  TASKS_UNLOCK_REQUEST,
  TASKS_UNLOCK_SUCCESS,
  TASKS_UNLOCK_FAILURE,
} from './TaskActionsConstants';
import { infoToastData } from '../common/ToastsHelpers/';
import {
  resumeToastInfo,
  cancelToastInfo,
  forceCancelToastInfo,
  unlockToastInfo,
  toastDispatch,
} from './TaskActionHelpers';

export const cancelTaskRequest = (id, name) => async dispatch => {
  dispatch(addToast(infoToastData(sprintf('Trying to cancel %s task', name))));
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

export const forceCancelTaskRequest = (id, name) => async dispatch => {
  dispatch({ type: TASKS_FORCE_CANCEL_REQUEST });
  try {
    await API.post(`/foreman_tasks/tasks/${id}/force_unlock`);
    dispatch({ type: TASKS_FORCE_CANCEL_SUCCESS });
    toastDispatch({
      type: 'forceCancelled',
      name,
      toastInfo: forceCancelToastInfo,
      dispatch,
    });
  } catch ({ response }) {
    dispatch({ type: TASKS_FORCE_CANCEL_FAILURE });
    toastDispatch({
      type: 'failed',
      name,
      toastInfo: forceCancelToastInfo,
      dispatch,
    });
  }
};

export const unlockTaskRequest = (id, name) => async dispatch => {
  dispatch({ type: TASKS_UNLOCK_REQUEST });
  try {
    await API.post(`/foreman_tasks/tasks/${id}/unlock`);
    dispatch({ type: TASKS_UNLOCK_SUCCESS });
    toastDispatch({
      type: 'unlocked',
      name,
      toastInfo: unlockToastInfo,
      dispatch,
    });
  } catch ({ response }) {
    dispatch({ type: TASKS_UNLOCK_FAILURE });
    toastDispatch({
      type: 'failed',
      name,
      toastInfo: unlockToastInfo,
      dispatch,
    });
  }
};

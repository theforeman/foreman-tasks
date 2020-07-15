import { API } from 'foremanReact/redux/API';
import {
  showLoading,
  hideLoading,
} from 'foremanReact/components/Layout/LayoutActions';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_REQUEST,
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_FETCH_TASK_FAILURE,
  FOREMAN_TASK_DETAILS_STOP_POLLING,
  FOREMAN_TASK_DETAILS_START_POLLING,
  TASK_STEP_CANCEL_REQUEST,
  TASK_STEP_CANCEL_FAILURE,
  TASK_STEP_CANCEL_SUCCESS,
} from './TaskDetailsConstants';
import {
  errorToastData,
  infoToastData,
  successToastData,
} from '../common/ToastsHelpers';

export const taskReloadStop = timeoutId => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  return {
    type: FOREMAN_TASK_DETAILS_STOP_POLLING,
    payload: { timeoutId },
  };
};

export const taskReloadStart = (
  timeoutId,
  refetchTaskDetails,
  id,
  loading = false
) => {
  if (!timeoutId) {
    timeoutId = setInterval(
      () => refetchTaskDetails(id, loading, timeoutId),
      5000
    );
  }
  return {
    type: FOREMAN_TASK_DETAILS_START_POLLING,
    payload: { timeoutId },
  };
};

export const refetchTaskDetails = (id, loading, timeoutId) => dispatch => {
  if (!loading) {
    showLoading();
    dispatch(startRequest());
    reloadTasksDetails(id, timeoutId, dispatch);
  }
};

const reloadTasksDetails = async (id, timeoutId, dispatch) => {
  try {
    const { data } = await API.get(
      `/foreman_tasks/api/tasks/${id}/details?include_permissions`
    );
    dispatch(requestSuccess(data));
  } catch (error) {
    dispatch(taskReloadStop(timeoutId));
    dispatch(requestFailure(error));
  } finally {
    hideLoading();
  }
};

export const fetchTaskDetails = (
  id,
  timeoutId,
  refetchTaskDetailsAction
) => async dispatch => {
  showLoading();
  dispatch(startRequest());
  await getTasksDetails(id, dispatch, timeoutId, refetchTaskDetailsAction);
};

const getTasksDetails = async (
  id,
  dispatch,
  timeoutId,
  refetchTaskDetailsAction
) => {
  try {
    const { data } = await API.get(
      `/foreman_tasks/api/tasks/${id}/details?include_permissions`
    );
    dispatch(requestSuccess(data));
    if (data.state !== 'stopped') {
      dispatch(taskReloadStart(timeoutId, refetchTaskDetailsAction, id));
    }
  } catch (error) {
    dispatch(requestFailure(error));
    if (timeoutId) dispatch(taskReloadStop(timeoutId));
  } finally {
    hideLoading();
  }
};

const startRequest = () => ({
  type: FOREMAN_TASK_DETAILS_FETCH_TASK_REQUEST,
});

const requestSuccess = data => ({
  type: FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  payload: data,
});

const requestFailure = error => ({
  type: FOREMAN_TASK_DETAILS_FETCH_TASK_FAILURE,
  payload: error,
});

export const cancelStep = (taskId, stepId) => async dispatch => {
  dispatch({ type: TASK_STEP_CANCEL_REQUEST });
  dispatch(addToast(infoToastData(`${__('Trying to cancel step')} ${stepId}`)));
  try {
    await API.post(
      `/foreman_tasks/tasks/${taskId}/cancel_step?step_id=${stepId}`
    );
    dispatch({ type: TASK_STEP_CANCEL_SUCCESS });
    dispatch(addToast(successToastData(`${stepId} {__('Step Canceled')}`)));
  } catch (error) {
    dispatch({ type: TASK_STEP_CANCEL_FAILURE, payload: error });
    dispatch(
      addToast(
        errorToastData(
          `${__('Could not cancel step.')} ${__(
            'Error:'
          )} ${stepId} ${error.response &&
            error.response.data &&
            error.response.data.error}`
        )
      )
    );
  }
};

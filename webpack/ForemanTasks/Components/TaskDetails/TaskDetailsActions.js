import API from 'foremanReact/API';
import {
  showLoading,
  hideLoading,
} from 'foremanReact/components/Layout/LayoutActions';
import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_REQUEST,
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_FETCH_TASK_FAILURE,
  FOREMAN_TASK_DETAILS_STOP_POLLING,
  FOREMAN_TASK_DETAILS_START_POLLING,
  FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
  FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
} from './TaskDetailsConstants';
import {
  cancelTaskRequest,
  resumeTaskRequest,
} from '../TasksTable/TasksTableActions';

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
    timeoutId = setInterval(() => refetchTaskDetails(id, loading), 5000);
  }
  return {
    type: FOREMAN_TASK_DETAILS_START_POLLING,
    payload: { timeoutId },
  };
};

export const refetchTaskDetails = (id, loading) => dispatch => {
  if (!loading) {
    showLoading();
    dispatch(startRequest());
    reloadTasksDetails(id, dispatch);
  }
};

const reloadTasksDetails = async (id, dispatch) => {
  try {
    const { data } = await API.get(`/foreman_tasks/api/tasks/${id}/details`);
    dispatch(requestSuccess(data));
  } catch (error) {
    dispatch(requestFailure(error));
    document.location.reload();
  } finally {
    hideLoading();
  }
};

export const fetchTaskDetails = (
  id,
  timeoutId,
  refetchTaskDetailsAction
) => dispatch => {
  showLoading();
  dispatch(startRequest());
  getTasksDetails(id, dispatch, timeoutId, refetchTaskDetailsAction);
};

const getTasksDetails = async (
  id,
  dispatch,
  timeoutId,
  refetchTaskDetailsAction
) => {
  try {
    const { data } = await API.get(`/foreman_tasks/api/tasks/${id}/details`);
    dispatch(requestSuccess(data));
    if (data.state !== 'stopped') {
      dispatch(taskReloadStart(timeoutId, refetchTaskDetailsAction, id));
    }
  } catch (error) {
    dispatch(requestFailure(error));
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

export const toggleUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
});
export const toggleForceUnlockModal = () => ({
  type: FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
});

export { cancelTaskRequest, resumeTaskRequest };

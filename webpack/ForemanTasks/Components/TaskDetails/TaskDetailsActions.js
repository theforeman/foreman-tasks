import API from 'foremanReact/API';
import { API_OPERATIONS } from 'foremanReact/redux/API';
import {
  showLoading,
  hideLoading,
} from 'foremanReact/components/Layout/LayoutActions';
import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_REQUEST,
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_FETCH_TASK_FAILURE,
  FOREMAN_TASK_DETAILS_STOP_PULLING,
  FOREMAN_TASK_DETAILS_START_PULLING,
  FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
  FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
} from './TaskDetailsConstants';

export const taskReloadStop = timeoutId => ({
  type: FOREMAN_TASK_DETAILS_STOP_PULLING,
  payload: { timeoutId },
});

export const taskReloadStart = (timeoutId, refetchTaskDetails, id) => ({
  type: FOREMAN_TASK_DETAILS_START_PULLING,
  payload: { timeoutId, refetchTaskDetails, id },
});

export const refetchTaskDetails = id => dispatch => {
  showLoading();
  dispatch(startRequest());
  reloadTasksDetails(id, dispatch);
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

export const fetchTaskDetails = id => dispatch => {
  showLoading();
  dispatch(startRequest());
  getTasksDetails(id, dispatch);
};

const getTasksDetails = async (id, dispatch) => {
  dispatch({
    type: API_OPERATIONS.GET,
    url: `/foreman_tasks/api/tasks/${id}/details`,
    outputType: 'FOREMAN_TASK_DETAILS_FETCH_TASK',
    /* onSuccess and OnFailure will be supported in the next API PR */
    onSuccess: hideLoading,
    onFailure: hideLoading,
  });
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

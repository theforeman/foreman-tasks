import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { sprintf } from 'foremanReact/common/I18n';
import {
  TASKS_TABLE_ID,
  SELECT_ROWS,
  UNSELECT_ALL_ROWS,
  SELECT_ALL_ROWS,
  UNSELECT_ROWS,
  UPDATE_CLICKED,
  OPEN_SELECT_ALL,
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_CANCEL_FAILURE,
} from './TasksTableConstants';
import { TOAST_TYPES } from '../common/ToastTypesConstants';
import { getApiPathname } from './TasksTableHelpers';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';
import {
  resumeToastInfo,
  cancelToastInfo,
  toastDispatch,
} from './TasksTableActionHelpers';

export const getTableItems = url =>
  getTableItemsAction(TASKS_TABLE_ID, getURIQuery(url), getApiPathname(url));

export const reloadPage = (url, parentTaskID, dispatch) => {
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time, parentTaskID));
};

export const cancelTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(cancelTaskRequest(taskId, taskName));
  reloadPage(url, parentTaskID, dispatch);
};

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
  } catch ({ response }) {
    dispatch({ type: TASKS_CANCEL_FAILURE, payload: response });
    toastDispatch({
      type: 'skipped',
      name,
      toastInfo: cancelToastInfo,
      dispatch,
    });
  }
};

export const resumeTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(resumeTaskRequest(taskId, taskName));
  reloadPage(url, parentTaskID, dispatch);
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
  } catch ({ response }) {
    dispatch({ type: TASKS_RESUME_FAILURE, payload: response });
    toastDispatch({
      type: 'failed',
      name,
      toastInfo: resumeToastInfo,
      dispatch,
    });
  }
};

export const selectPage = results => dispatch => {
  dispatch({
    type: SELECT_ROWS,
    payload: results.map(row => row.id),
  });
  dispatch({
    type: OPEN_SELECT_ALL,
  });
};

export const selectAllRows = () => ({
  type: SELECT_ALL_ROWS,
});

export const unselectAllRows = () => ({
  type: UNSELECT_ALL_ROWS,
});

export const selectRow = id => ({
  type: SELECT_ROWS,
  payload: [id],
});

export const unselectRow = (id, results) => ({
  type: UNSELECT_ROWS,
  payload: { id, results },
});

export const openClickedModal = ({ taskId, taskName, setModalOpen }) => {
  setModalOpen();
  return {
    type: UPDATE_CLICKED,
    payload: { clicked: { taskId, taskName } },
  };
};

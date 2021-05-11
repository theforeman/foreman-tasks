import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';

import {
  TASKS_TABLE_ID,
  SELECT_ROWS,
  UNSELECT_ALL_ROWS,
  SELECT_ALL_ROWS,
  UNSELECT_ROWS,
  UPDATE_CLICKED,
  OPEN_SELECT_ALL,
  UPDATE_MODAL,
} from './TasksTableConstants';
import { getApiPathname } from './TasksTableHelpers';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';
import {
  cancelTaskRequest,
  resumeTaskRequest,
  forceCancelTaskRequest,
} from '../TaskActions';
import { convertDashboardQuery } from '../TaskActions/TaskActionHelpers';

export const getTableItems = url =>
  getTableItemsAction(
    TASKS_TABLE_ID,
    convertDashboardQuery(getURIQuery(url)),
    getApiPathname(url)
  );

export const reloadPage = (url, parentTaskID) => dispatch => {
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
  reloadPage(url, parentTaskID)(dispatch);
};

export const resumeTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(resumeTaskRequest(taskId, taskName));
  reloadPage(url, parentTaskID)(dispatch);
};

export const forceCancelTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(forceCancelTaskRequest(taskId, taskName));
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time, parentTaskID));
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

export const openModalAction = (modalID, setModalOpen) => {
  setModalOpen();
  return {
    type: UPDATE_MODAL,
    payload: { modalID },
  };
};

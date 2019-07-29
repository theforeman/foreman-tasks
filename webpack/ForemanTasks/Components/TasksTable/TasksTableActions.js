import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  TASKS_TABLE_ID,
  SELECT_ROWS,
  UNSELECT_ALL_ROWS,
  UNSELECT_ROWS,
  TASKS_TABLE_SELECTED_MODAL,
  CLOSED,
  RESUME,
  CANCEL,
} from './TasksTableConstants';
import { getApiPathname } from './TasksTableHelpers';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';

export const getTableItems = url =>
  getTableItemsAction(TASKS_TABLE_ID, getURIQuery(url), getApiPathname(url));

export const cancelTask = (id, name, url, parentTaskID) => async dispatch => {
  await dispatch(cancelTaskRequest(id, name));
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time, parentTaskID));
};

export const cancelTaskRequest = (id, name) => async dispatch => {
  dispatch(
    addToast({
      type: 'info',
      message: `${__('Trying to cancel')} "${name}" ${__('task')}`,
    })
  );
  try {
    await API.post(`/foreman_tasks/tasks/${id}/cancel`);
    dispatch(
      addToast({
        type: 'success',
        message: `"${name}" ${__('Task cancelled')}`,
      })
    );
  } catch ({ response }) {
    dispatch(
      addToast({
        type: 'error',
        message: `"${name}" ${__('Task cannot be cancelled at the moment.')}`,
      })
    );
  }
};

export const resumeTask = (id, name, url, parentTaskID) => async dispatch => {
  await dispatch(resumeTaskRequest(id, name));
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time), parentTaskID);
};

export const resumeTaskRequest = (id, name) => async dispatch => {
  try {
    await API.post(`/foreman_tasks/tasks/${id}/resume`);
    dispatch(
      addToast({
        type: 'success',
        message: __(`"${name}" ${__('Task execution was resumed')}`),
      })
    );
  } catch ({ response }) {
    dispatch(
      addToast({
        type: 'error',
        message: __(`Task "${name}" has to be resumable.`),
      })
    );
  }
};

export const selectAllRows = results => ({
  type: SELECT_ROWS,
  payload: results.map(row => row.id),
});

export const unselectAllRows = () => ({
  type: UNSELECT_ALL_ROWS,
});

export const selectRow = id => ({
  type: SELECT_ROWS,
  payload: [id],
});

export const unselectRow = id => ({
  type: UNSELECT_ROWS,
  payload: id,
});

export const actionSelected = (actionType, selected, url) => async dispatch => {
  let notAllActionable = false;
  let someActionable = false;
  const promises = selected.map(task => {
    if (actionType === RESUME && task.isResumeble) {
      someActionable = true;
      return dispatch(resumeTaskRequest(task.id, task.name, url));
    } else if (actionType === CANCEL && task.isCancelleble) {
      someActionable = true;
      return dispatch(cancelTaskRequest(task.id, task.name, url));
    }
    notAllActionable = true;
    return null;
  });
  if (notAllActionable)
    dispatch(
      addToast({
        type: 'warning',
        message: __(
          `Not all the selected tasks can be ${
            actionType === RESUME ? 'resumed' : 'canceled'
          }`
        ),
      })
    );
  if (someActionable) {
    await Promise.all(promises);
    dispatch(getTableItems(url));
    dispatch(fetchTasksSummary(getURIQuery(url).time));
  }
};

export const showCancelSelcetedModal = () => ({
  type: TASKS_TABLE_SELECTED_MODAL,
  payload: CANCEL,
});

export const showResumeSelcetedModal = () => ({
  type: TASKS_TABLE_SELECTED_MODAL,
  payload: RESUME,
});

export const hideSelcetedModal = () => ({
  type: TASKS_TABLE_SELECTED_MODAL,
  payload: CLOSED,
});

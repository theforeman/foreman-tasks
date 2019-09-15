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
  TASKS_TABLE_SHOW_CANCEL_ALL_MODAL,
  TASKS_TABLE_HIDE_CANCEL_ALL_MODAL,
} from './TasksTableConstants';
import { getApiPathname } from './TasksTableHelpers';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';

export const getTableItems = url =>
  getTableItemsAction(TASKS_TABLE_ID, getURIQuery(url), getApiPathname(url));

export const cancelTask = (id, name, url) => async dispatch => {
  await dispatch(cancelTaskRequest(id, name));
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time));
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

export const resumeTask = (id, name, url) => async dispatch => {
  await dispatch(resumeTaskRequest(id, name));
  dispatch(getTableItems(url));
  dispatch(fetchTasksSummary(getURIQuery(url).time));
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

export const cancelSelected = (selected, url) => async dispatch => {
  let notAllCancelleble = false;
  let someCancelleble = false;
  const promises = selected.map(task => {
    if (task.isCancelleble) {
      someCancelleble = true;
      return dispatch(cancelTaskRequest(task.id, task.name));
    }
    notAllCancelleble = true;
    return null;
  });
  if (notAllCancelleble)
    dispatch(
      addToast({
        type: 'warning',
        message: __('Not all the selected tasks can be canceled'),
      })
    );
  if (someCancelleble) {
    await Promise.all(promises);
    dispatch(getTableItems(url));
    dispatch(fetchTasksSummary(getURIQuery(url).time));
  }
};

export const showCancelAllModal = () => ({
  type: TASKS_TABLE_SHOW_CANCEL_ALL_MODAL,
});

export const hideCancelAllModal = () => ({
  type: TASKS_TABLE_HIDE_CANCEL_ALL_MODAL,
});

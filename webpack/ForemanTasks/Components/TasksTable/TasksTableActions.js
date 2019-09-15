import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __ } from 'foremanReact/common/I18n';
import { TASKS_TABLE_ID } from './TasksTableConstants';
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
        message: `"${name}" ${__('task cancelled')}`,
      })
    );
  } catch ({ response }) {
    dispatch(
      addToast({
        type: 'error',
        message: `"${name}" ${__('task cannot be cancelled at the moment.')}`,
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

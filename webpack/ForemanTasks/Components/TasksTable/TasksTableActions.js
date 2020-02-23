import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import URI from 'urijs';
import {
  TASKS_TABLE_ID,
  SELECT_ROWS,
  UNSELECT_ALL_ROWS,
  UNSELECT_ROWS,
  UPDATE_CLICKED,
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
} from './TasksTableConstants';
import { getApiPathname } from './TasksTableHelpers';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';

export const getTableItems = url =>
  getTableItemsAction(TASKS_TABLE_ID, getURIQuery(url), getApiPathname(url));

export const cancelTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(cancelTaskRequest(taskId, taskName));
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

export const resumeTask = ({
  taskId,
  taskName,
  url,
  parentTaskID,
}) => async dispatch => {
  await dispatch(resumeTaskRequest(taskId, taskName));
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

export const bulkResumeRequest = resumeTasks => {
  const ids = resumeTasks.map(task => task.id);
  const url = new URI('/foreman_tasks/api/tasks/bulk_resume');
  url.setSearch('task_ids[]', ids);
  return API.post(url);
};

export const bulkResume = ({
  selected,
  url,
  parentTaskID,
}) => async dispatch => {
  const resumeTasks = selected.filter(task => task.isResumable);
  if (resumeTasks.length < selected.length)
    dispatch(
      addToast({
        type: 'warning',
        message: __('Not all the selected tasks can be resumed'),
      })
    );
  if (resumeTasks.length) {
    try {
      dispatch({ type: TASKS_RESUME_REQUEST });
      const { data } = await bulkResumeRequest(resumeTasks);
      dispatch({ type: TASKS_RESUME_SUCCESS });
      const toastInfo = {
        resumed: { type: 'success', text: 'was resumed' },
        failed: { type: 'error', text: 'could not be resumed' },
      };
      const toastDispatch = (type, name) =>
        dispatch(
          addToast({
            type: toastInfo[type].type,
            message: sprintf(__('%(name)s Task execution %(type)s'), {
              name,
              type: toastInfo[type].text,
            }),
          })
        );

      ['resumed', 'failed'].forEach(type => {
        data[type].forEach(task => {
          toastDispatch(type, task.action);
        });
      });
      if (data.resumed.length) {
        dispatch(getTableItems(url));
        dispatch(fetchTasksSummary(getURIQuery(url).time, parentTaskID));
      }
    } catch (error) {
      dispatch({ type: TASKS_RESUME_FAILURE, error });
      dispatch(
        addToast({
          type: 'error',
          message: `${__(`Cannot resume tasks at the moment`)} ${error}`,
        })
      );
    }
  }
};

export const bulkCancel = ({
  selected,
  url,
  parentTaskID,
}) => async dispatch => {
  let notAllActionable = false;
  let someActionable = false;
  const promises = selected.map(task => {
    if (task.isCancellable) {
      someActionable = true;
      return dispatch(cancelTaskRequest(task.id, task.name));
    }
    notAllActionable = true;
    return null;
  });

  if (notAllActionable)
    dispatch(
      addToast({
        type: 'warning',
        message: __('Not all the selected tasks can be canceled'),
      })
    );
  if (someActionable) {
    await Promise.all(promises);
    dispatch(getTableItems(url));
    dispatch(fetchTasksSummary(getURIQuery(url).time, parentTaskID));
  }
};

export const openClickedModal = ({ taskId, taskName, setModalOpen }) => {
  setModalOpen();
  return {
    type: UPDATE_CLICKED,
    payload: { clicked: { taskId, taskName } },
  };
};

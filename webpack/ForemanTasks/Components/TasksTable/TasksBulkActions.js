import API from 'foremanReact/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __ } from 'foremanReact/common/I18n';
import { TOAST_TYPES } from '../common/ToastTypesConstants';
import {
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_CANCEL_FAILURE,
  BULK_CANCEL_PATH,
  BULK_RESUME_PATH,
} from './TasksTableConstants';
import { reloadPage } from './TasksTableActions';
import {
  convertDashboardQuery,
  resumeToastInfo,
  cancelToastInfo,
  toastDispatch,
} from './TasksTableActionHelpers';

export const bulkByIdRequest = (resumeTasks, path) => {
  const ids = resumeTasks.map(task => task.id);
  const url = `/foreman_tasks/api/tasks/${path}`;
  const data = { task_ids: ids };
  return API.post(url, data);
};

export const bulkBySearchRequest = ({ query, parentTaskID, path }) => {
  const url = `/foreman_tasks/api/tasks/${path}`;
  if (parentTaskID) {
    query.search = query.search
      ? ` ${query.search} and parent_task_id=${parentTaskID}`
      : `parent_task_id=${parentTaskID}`;
  }
  const searchParam = { search: convertDashboardQuery(query) };
  return API.post(url, searchParam);
};

const handleErrorResume = (error, dispatch) => {
  dispatch({ type: TASKS_RESUME_FAILURE, error });
  dispatch(
    addToast({
      type: TOAST_TYPES.ERROR,
      message: `${__(`Cannot resume tasks at the moment`)} ${error}`,
    })
  );
};

export const bulkResumeById = ({
  selected,
  url,
  parentTaskID,
}) => async dispatch => {
  const resumeTasks = selected.filter(task => task.isResumable);
  if (resumeTasks.length < selected.length)
    dispatch(
      addToast({
        type: TOAST_TYPES.WARNING,
        message: __('Not all the selected tasks can be resumed'),
      })
    );
  if (resumeTasks.length) {
    dispatch({ type: TASKS_RESUME_REQUEST });
    try {
      const { data } = await bulkByIdRequest(resumeTasks, BULK_RESUME_PATH);
      dispatch({ type: TASKS_RESUME_SUCCESS });
      ['resumed', 'failed', 'skipped'].forEach(type => {
        data[type] &&
          data[type].forEach(task => {
            toastDispatch({
              type,
              name: task.action,
              toastInfo: resumeToastInfo,
              dispatch,
            });
          });
      });
      if (data.resumed) {
        reloadPage(url, parentTaskID, dispatch);
      }
    } catch (error) {
      handleErrorResume(error, dispatch);
    }
  }
};

export const bulkResumeBySearch = ({
  query,
  parentTaskID,
}) => async dispatch => {
  dispatch({ type: TASKS_RESUME_REQUEST });
  dispatch(
    addToast({
      type: 'info',
      message: __('Resuming selected tasks, this might take a while'),
    })
  );
  await bulkBySearchRequest({ query, path: BULK_RESUME_PATH, parentTaskID });
};

const handleErrorCancel = (error, dispatch) => {
  dispatch({ type: TASKS_CANCEL_FAILURE, error });
  dispatch(
    addToast({
      type: TOAST_TYPES.ERROR,
      message: `${__(`Cannot cancel tasks at the moment`)} ${error}`,
    })
  );
};

export const bulkCancelBySearch = ({
  query,
  parentTaskID,
}) => async dispatch => {
  dispatch({ type: TASKS_CANCEL_REQUEST });
  dispatch(
    addToast({
      type: 'info',
      message: __('Canceling selected tasks, this might take a while'),
    })
  );
  await bulkBySearchRequest({ query, path: BULK_CANCEL_PATH, parentTaskID });
};

export const bulkCancelById = ({
  selected,
  url,
  parentTaskID,
}) => async dispatch => {
  const cancelTasks = selected.filter(task => task.isCancellable);
  if (cancelTasks.length < selected.length)
    dispatch(
      addToast({
        type: TOAST_TYPES.WARNING,
        message: __('Not all the selected tasks can be cancelled'),
      })
    );
  if (cancelTasks.length) {
    dispatch({ type: TASKS_CANCEL_REQUEST });
    try {
      const { data } = await bulkByIdRequest(cancelTasks, BULK_CANCEL_PATH);
      dispatch({ type: TASKS_CANCEL_SUCCESS });

      ['cancelled', 'skipped'].forEach(type => {
        data[type] &&
          data[type].forEach(task => {
            toastDispatch({
              type,
              name: task.action,
              toastInfo: cancelToastInfo,
              dispatch,
            });
          });
      });
      if (data.cancelled) {
        reloadPage(url, parentTaskID, dispatch);
      }
    } catch (error) {
      handleErrorCancel(error, dispatch);
    }
  }
};

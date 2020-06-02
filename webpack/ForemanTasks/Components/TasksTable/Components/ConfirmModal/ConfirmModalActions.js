import {
  resumeTask,
  cancelTask,
  forceCancelTask,
} from '../../TasksTableActions';
import {
  bulkCancelBySearch,
  bulkCancelById,
  bulkResumeBySearch,
  bulkResumeById,
  bulkForceCancelBySearch,
  bulkForceCancelById,
} from '../../TasksBulkActions';
import { selectClicked, selectSelectedTasks } from './ConfirmModalSelectors';
import { selectAllRowsSelected } from '../../TasksTableSelectors';
import {
  CANCEL_MODAL,
  RESUME_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  FORCE_UNLOCK_SELECTED_MODAL,
} from '../../TasksTableConstants';
import { FORCE_UNLOCK_MODAL } from '../../../TaskActions/TaskActionsConstants';

export default {
  [CANCEL_SELECTED_MODAL]: ({ url, query, parentTaskID }) => (
    dispatch,
    getState
  ) => {
    if (selectAllRowsSelected(getState())) {
      return dispatch(bulkCancelBySearch({ query, parentTaskID }));
    }
    return dispatch(
      bulkCancelById({
        selected: selectSelectedTasks(getState()),
        url,
        parentTaskID,
      })
    );
  },
  [CANCEL_MODAL]: ({ url, parentTaskID }) => (dispatch, getState) => {
    const { taskId, taskName } = selectClicked(getState());
    return dispatch(
      cancelTask({
        taskId,
        taskName,
        url,
        parentTaskID,
      })
    );
  },
  [RESUME_SELECTED_MODAL]: ({ url, query, parentTaskID }) => (
    dispatch,
    getState
  ) => {
    if (selectAllRowsSelected(getState())) {
      return dispatch(bulkResumeBySearch({ query, parentTaskID }));
    }
    return dispatch(
      bulkResumeById({
        selected: selectSelectedTasks(getState()),
        url,
        parentTaskID,
      })
    );
  },

  [RESUME_MODAL]: ({ url, parentTaskID }) => (dispatch, getState) => {
    const { taskId, taskName } = selectClicked(getState());
    return dispatch(
      resumeTask({
        taskId,
        taskName,
        url,
        parentTaskID,
      })
    );
  },

  [FORCE_UNLOCK_MODAL]: ({ url, parentTaskID }) => (dispatch, getState) => {
    const { taskId, taskName } = selectClicked(getState());
    return dispatch(
      forceCancelTask({
        taskId,
        taskName,
        url,
        parentTaskID,
      })
    );
  },
  [FORCE_UNLOCK_SELECTED_MODAL]: ({ url, query, parentTaskID }) => (
    dispatch,
    getState
  ) => {
    if (selectAllRowsSelected(getState())) {
      return dispatch(bulkForceCancelBySearch({ query, parentTaskID }));
    }
    return dispatch(
      bulkForceCancelById({
        selected: selectSelectedTasks(getState()),
        url,
        parentTaskID,
      })
    );
  },
};

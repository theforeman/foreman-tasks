import { selectForemanTasks } from '../../../../ForemanTasksSelectors';
import {
  selectTasksTableQuery,
  selectResults,
  selectSelectedRows,
  selectItemCount,
  selectAllRowsSelected,
} from '../../TasksTableSelectors';
import { RESUME_MODAL, CANCEL_MODAL } from '../../TasksTableConstants';
import { FORCE_UNLOCK_MODAL } from '../../../TaskActions/TaskActionsConstants';

export const selectCofirmModal = state =>
  selectForemanTasks(state).confirmModal || {};

export const selectActionType = state => selectCofirmModal(state).actionType;
export const selectActionText = state => selectCofirmModal(state).actionText;
export const selectActionState = state => selectCofirmModal(state).actionState;
export const selectClicked = state =>
  selectTasksTableQuery(state).clicked || {};

export const selectSelectedTasks = state => {
  const selectedIDs = selectResults(state).filter(item =>
    selectSelectedRows(state).includes(item.id)
  );
  return selectedIDs.map(item => ({
    name: item.action,
    id: item.id,
    isCancellable: item.availableActions.cancellable,
    isResumable: item.availableActions.resumable,
    canEdit: item.canEdit,
  }));
};

export const selectSelectedRowsLen = state => {
  if (
    [CANCEL_MODAL, RESUME_MODAL, FORCE_UNLOCK_MODAL].includes(
      selectActionType(state)
    )
  ) {
    return 1;
  }
  if (selectAllRowsSelected(state)) {
    return selectItemCount(state);
  }
  return selectSelectedRows(state).length;
};

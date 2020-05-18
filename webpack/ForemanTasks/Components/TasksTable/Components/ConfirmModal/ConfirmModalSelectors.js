import { selectForemanTasks } from '../../../../ForemanTasksSelectors';

export const selectCofirmModal = state =>
  selectForemanTasks(state).confirmModal || {};

export const selectActionType = state => selectCofirmModal(state).actionType;
export const selectActionText = state => selectCofirmModal(state).actionText;
export const selectActionState = state => selectCofirmModal(state).actionState;

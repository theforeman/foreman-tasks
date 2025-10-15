import {
  selectTasksTableQuery,
  selectResults,
  selectSelectedRows,
  selectItemCount,
  selectAllRowsSelected,
} from '../../TasksTableSelectors';

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
  if (selectAllRowsSelected(state)) {
    return selectItemCount(state);
  }
  return selectSelectedRows(state).length;
};

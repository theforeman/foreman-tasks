import { createSelector } from 'reselect';
import { translate as __ } from 'foremanReact/common/I18n';
import { selectForemanTasks } from '../../ForemanTasksSelectors';
import { getDuration } from './TasksTableHelpers';

export const selectTasksTable = state =>
  selectForemanTasks(state).tasksTable || {};

export const selectTasksTableContent = state =>
  selectTasksTable(state).tasksTableContent || {};

export const selectTasksTableQuery = state =>
  selectTasksTable(state).tasksTableQuery || {};

export const selectPerPage = state =>
  selectTasksTableQuery(state).perPage || 20;

export const selectItemCount = state =>
  selectTasksTableQuery(state).itemCount || 0;

export const selectActionName = state =>
  selectTasksTableQuery(state).actionName || '';

export const selectSelectedRows = state =>
  selectTasksTableQuery(state).selectedRows || [];

export const selectPermissions = state =>
  selectTasksTableQuery(state).permissions || { edit: false };

export const selectResults = createSelector(
  selectTasksTableContent,
  ({ results }) =>
    results.map(result => ({
      ...result,
      action:
        result.action ||
        (result.label ? result.label.replace(/::/g, ' ') : result.id),
      username: result.username || '',
      state: result.state + (result.frozen ? ` ${__('Disabled')}` : ''),
      duration: getDuration(result.started_at, result.ended_at),
      availableActions: {
        ...result.available_actions,
        stoppable: result.state !== 'stopped',
      },
      canEdit: result.can_edit,
    }))
);

export const selectStatus = state => selectTasksTableContent(state).status;

export const selectError = state => selectTasksTableContent(state).error;

export const selectSort = state =>
  selectTasksTableQuery(state).sort || { by: 'started_at', order: 'DESC' };

export const selectAllRowsSelected = state =>
  selectTasksTableQuery(state).allRowsSelected;

export const selectShowSelectAll = state =>
  selectTasksTableQuery(state).showSelectAll;

export const selectModalID = state =>
  selectTasksTableQuery(state).modalID || '';

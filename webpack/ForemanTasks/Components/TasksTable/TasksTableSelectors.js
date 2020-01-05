import { translate as __ } from 'foremanReact/common/I18n';
import { selectForemanTasks } from '../../ForemanTasksSelectors';
import { getDuration } from './TasksTableHelpers';

export const selectTasksTable = state =>
  selectForemanTasks(state).tasksTable || {};

export const selectTasksTableContent = state =>
  selectTasksTable(state).tasksTableContent || {};

export const selectTasksTableQuery = state =>
  selectTasksTable(state).tasksTableQuery || {};

export const selectPagitation = state =>
  selectTasksTableQuery(state).pagination || {};

export const selectItemCount = state =>
  selectTasksTableQuery(state).itemCount || 0;

export const selectActionName = state =>
  selectTasksTableQuery(state).actionName || '';

export const selectSelectedRows = state =>
  selectTasksTableQuery(state).selectedRows || [];

export const selectClicked = state =>
  selectTasksTableQuery(state).clicked || {};

export const selectResults = state => {
  const { results } = selectTasksTableContent(state);
  if (!results) return [];
  return results.map(result => ({
    ...result,
    action: result.action || result.label.replace(/::/g, ' '),
    username: result.username || '',
    state: result.state + (result.frozen ? ` ${__('Disabled')}` : ''),
    duration: getDuration(result.started_at, result.ended_at),
    availableActions: result.available_actions,
  }));
};

export const selectStatus = state => selectTasksTableContent(state).status;

export const selectError = state => selectTasksTableContent(state).error;

export const selectSort = state =>
  selectTasksTableQuery(state).sort || { by: 'started_at', order: 'DESC' };

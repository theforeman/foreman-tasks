import { selectForemanTasks } from '../../ForemanTasksSelectors';

export const selectTasksTable = state =>
  selectForemanTasks(state).tasksTable || {};

export const selectTasksTableContent = state =>
  selectTasksTable(state).tasksTableContent || {};

export const selectTasksTableQuery = state =>
  selectTasksTable(state).tasksTableQuery || {};

export const selectQuery = state => selectTasksTableQuery(state).query || {};

export const selectLoading = state =>
  selectTasksTableQuery(state).loading || false;

export const selectPagitation = state =>
  selectTasksTableQuery(state).pagination || {};

export const selectItemCount = state =>
  selectTasksTableQuery(state).itemCount || 0;

const formatDate = date =>
  date
    ? new Date(date).toLocaleString('en-GB', {
        hour12: false,
        timeZoneName: 'short',
      })
    : __('N/A');

const formatUsername = username => (username ? username.name : '');

export const selectResults = state => {
  const { results } = selectTasksTableContent(state);
  if (!results) return [];
  return results.map(result => ({
    ...result,
    username: formatUsername(result.username),
    state: result.state + (result.frozen ? ` ${__('Disabled')}` : ''),
    started_at: formatDate(result.started_at, selectTasksTable(state).locale),
    ended_at: formatDate(result.ended_at, selectTasksTable(state).locale),
  }));
};

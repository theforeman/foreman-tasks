import { translate as __ } from 'foremanReact/common/I18n';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { selectForemanTasks } from '../../ForemanTasksSelectors';

export const selectTasksTable = state =>
  selectForemanTasks(state).tasksTable.tasksTableContent || {};

export const selectTasksTablePagitanion = state =>
  selectForemanTasks(state).tasksTable.tasksTablePagination || {};

const formatDate = date =>
  date
    ? new Date(date).toLocaleString('en-GB', {
        hour12: false,
        timeZoneName: 'short',
      })
    : __('N/A');

export const selectResults = state =>
  selectTasksTable(state).results.map(result => ({
    ...result,
    state: result.state + (result.frozen ? ` ${__('Disabled')}` : ''),
    started_at: formatDate(result.started_at),
    ended_at: formatDate(result.ended_at),
  }));

export const tasksPageSearchString = state => {
  const { searchBar } = state.autocomplete;
  let searchQuery;
  if (searchBar) {
    searchQuery = searchBar.searchQuery || '';
  }
  return searchQuery || getURIsearch() || '';
};

export const tasksPageSearchLabels = state => {
  const { tasksDashboard } = selectForemanTasks(state);
  if (tasksDashboard) {
    const { query } = tasksDashboard;
    if (query.mode === 'last') {
      return { ...query, mode: 'recent' };
    }
    return query;
  }
  return null;
};

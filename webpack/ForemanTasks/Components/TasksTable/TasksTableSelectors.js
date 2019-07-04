import { selectForemanTasks } from '../../ForemanTasksSelectors';

export const selectTasksTable = state =>
  selectForemanTasks(state).tasksTable || {};

const formatDate = (date, locale = 'en-GB') =>
  date &&
  new Date(date).toLocaleString(locale, {
    hour12: false,
    timeZoneName: 'short',
  });

export const selectResults = state =>
  selectTasksTable(state).results.map(result => ({
    ...result,
    state: result.state + (result.frozen ? ` ${__('Disabled')}` : ''),
    started_at: formatDate(result.started_at, selectTasksTable(state).locale),
    ended_at: formatDate(result.ended_at, selectTasksTable(state).locale),
  }));

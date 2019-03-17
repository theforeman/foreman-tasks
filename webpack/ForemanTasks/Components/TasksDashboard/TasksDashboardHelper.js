import {
  TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES,
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS,
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS_TEXT,
} from './TasksDashboardConstants';

export const getTimePeriodText = timePeriod =>
  TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS_TEXT[timePeriod];

export const createSearchQueryByType = (type, timePeriod) => {
  switch (type) {
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.RUNNING:
      return 'state=running';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.PAUSED:
      return 'state=paused';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.STOPPED:
      return 'state=stopped';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SCHEDULED:
      return 'state=scheduled';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.LAST:
      return `started_at>=${createDateQueryByTimePeriod(timePeriod)}`;
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.OVER:
      return `started_at<${createDateQueryByTimePeriod(timePeriod)}`;
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.ERROR:
      return 'result=error';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.WARNING:
      return 'result=warning';
    case TASKS_DASHBOARD_AVAILABLE_SEARCH_QUERY_TYPES.SUCCESS:
      return 'result=success';
    default:
      return '';
  }
};

export const createDateQueryByTimePeriod = timePeriod => {
  switch (timePeriod) {
    case TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H24:
      return createTimeForQuery(24 * 60 * 60 * 1000);
    case TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.H12:
      return createTimeForQuery(12 * 60 * 60 * 1000);
    case TASKS_DASHBOARD_AVAILABLE_TIME_PERIODS.WEEK:
      return createTimeForQuery(7 * 24 * 60 * 60 * 1000);
    default:
      return '';
  }
};

export const searchQueryIncludes = (query, term) => {
  const queryWithoutSpaces = query.replace(new RegExp(' ', 'g'), '');

  return queryWithoutSpaces.includes(term);
};

export const createTimeForQuery = millisecondsAgo => {
  const time = new Date(new Date().getTime() - millisecondsAgo);

  time.setMinutes(0);
  time.setSeconds(0);
  time.setMilliseconds(0);

  return time.toJSON();
};

import { selectForemanTasks } from '../../ForemanTasksSelectors';
import { TASKS_DASHBOARD_AVAILABLE_TIMES } from './TasksDashboardConstants';

export const selectTasksDashboard = state =>
  selectForemanTasks(state).tasksDashboard || {};

export const selectTime = state =>
  selectTasksDashboard(state).time || TASKS_DASHBOARD_AVAILABLE_TIMES.H24;

export const selectQuery = state => selectTasksDashboard(state).query || {};

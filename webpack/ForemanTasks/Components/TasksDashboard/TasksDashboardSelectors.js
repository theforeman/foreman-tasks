import { selectForemanTasks } from '../../ForemanTasksSelectors';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_SUMMARY_ZERO,
} from './TasksDashboardConstants';

export const selectTasksDashboard = state =>
  selectForemanTasks(state).tasksDashboard || {};

export const selectTime = state =>
  selectTasksDashboard(state).time || TASKS_DASHBOARD_AVAILABLE_TIMES.H24;

export const selectQuery = state => selectTasksDashboard(state).query || {};

export const selectTasksSummary = state => {
  const { running, paused, stopped, scheduled } =
    selectTasksDashboard(state).tasksSummary || TASKS_SUMMARY_ZERO;

  return {
    running: {
      last: running.recent,
      older: running.total - running.recent,
    },
    paused: {
      last: paused.recent,
      older: paused.total - paused.recent,
    },
    stopped: {
      error: {
        total: stopped.by_result.error.total,
        last: stopped.by_result.error.recent,
      },
      warning: {
        total: stopped.by_result.warning.total,
        last: stopped.by_result.warning.recent,
      },
      success: {
        total: stopped.by_result.success.total,
        last: stopped.by_result.success.recent,
      },
    },
    scheduled: scheduled.total,
  };
};

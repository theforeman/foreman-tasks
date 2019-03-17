import { selectTasksSummary } from './TasksDashboardSelectors';

export const tasksSummary = {
  running: {
    recent: 1,
    total: 3,
  },
  paused: {
    recent: 3,
    total: 4,
  },
  stopped: {
    by_result: {
      error: {
        total: 5,
        recent: 6,
      },
      warning: {
        total: 7,
        recent: 8,
      },
      success: {
        total: 9,
        recent: 10,
      },
    },
  },
  scheduled: {
    total: 11,
  },
};

export const tasksDashboardProps = {
  tasksSummary: selectTasksSummary({
    foremanTasks: {
      tasksDashboard: { tasksSummary },
    },
  }),
};

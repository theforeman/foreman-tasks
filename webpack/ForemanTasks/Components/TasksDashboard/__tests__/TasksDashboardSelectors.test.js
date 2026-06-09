import {
  selectTasksDashboard,
  selectTime,
  selectQuery,
  selectTasksSummary,
  calcStoppedOther,
} from '../TasksDashboardSelectors';
import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../TasksDashboardConstants';

const stoppedResult = {
  error: {
    total: 9,
    recent: 1,
  },
  warning: {
    total: 8,
    recent: 2,
  },
  success: {
    total: 7,
    recent: 3,
  },
  cancelled: {
    total: 5,
    recent: 3,
  },
  pending: {
    total: 11,
    recent: 4,
  },
};

const state = {
  foremanTasks: {
    tasksDashboard: {
      time: 'some-time',
      query: 'some-query',
      tasksSummary: {
        running: {
          recent: 3,
          total: 8,
        },
        paused: {
          recent: 2,
          total: 9,
        },
        stopped: {
          by_result: stoppedResult,
        },
        scheduled: {
          total: 6,
        },
      },
    },
  },
};

const emptyTasksSummary = {
  paused: {
    last: 0,
    older: 0,
  },
  running: {
    last: 0,
    older: 0,
  },
  scheduled: 0,
  stopped: {
    other: 0,
    results: {
      error: {
        last: 0,
        total: 0,
      },
      success: {
        last: 0,
        total: 0,
      },
      warning: {
        last: 0,
        total: 0,
      },
    },
  },
};

describe('TasksDashboard - Selectors', () => {
  it('should select tasks-dashboard', () => {
    expect(selectTasksDashboard(state)).toEqual(
      state.foremanTasks.tasksDashboard
    );
  });

  it('should select tasks-dashboard when state is empty', () => {
    expect(selectTasksDashboard({})).toEqual({});
  });

  it('should select time', () => {
    expect(selectTime(state)).toBe('some-time');
  });

  it('should select time when state is empty', () => {
    expect(selectTime({})).toBe(TASKS_DASHBOARD_AVAILABLE_TIMES.H24);
  });

  it('should select query', () => {
    const query = { state: 'running' };
    const stateWithQuery = {
      ...state,
      foremanTasks: {
        ...state.foremanTasks,
        tasksDashboard: { ...state.foremanTasks.tasksDashboard, query },
      },
    };

    expect(selectQuery(stateWithQuery)).toEqual(query);
  });

  it('should select query when state is empty', () => {
    expect(selectQuery({})).toEqual({});
  });

  it('should select tasks-summary', () => {
    expect(selectTasksSummary(state)).toEqual({
      paused: {
        last: 2,
        older: 7,
      },
      running: {
        last: 3,
        older: 5,
      },
      scheduled: 6,
      stopped: {
        other: 16,
        results: {
          error: {
            last: 1,
            total: 9,
          },
          success: {
            last: 3,
            total: 7,
          },
          warning: {
            last: 2,
            total: 8,
          },
        },
      },
    });
  });

  it('should select tasks-summary when state is empty', () => {
    expect(selectTasksSummary({})).toEqual(emptyTasksSummary);
  });

  it('should calcStoppedOther', () => {
    expect(calcStoppedOther(stoppedResult)).toBe(16);
  });
});

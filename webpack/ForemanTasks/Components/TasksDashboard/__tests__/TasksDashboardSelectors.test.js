import { testSelectorsSnapshotWithFixtures } from '@theforeman/test';
import {
  selectTasksDashboard,
  selectTime,
  selectQuery,
  selectTasksSummary,
  calcStoppedOther,
} from '../TasksDashboardSelectors';

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

const fixtures = {
  'should select tasks-dashboard': () => selectTasksDashboard(state),
  'should select tasks-dashboard when state is empty': () =>
    selectTasksDashboard({}),
  'should select time': () => selectTime(state),
  'should select time when state is empty': () => selectTime({}),
  'should select query': () => selectQuery(state),
  'should select query when state is empty': () => selectQuery({}),
  'should select tasks-summary': () => selectTasksSummary(state),
  'should select tasks-summary when state is empty': () =>
    selectTasksSummary({}),
  'should calcStoppedOther': () => calcStoppedOther(stoppedResult),
};

describe('TasksDashboard - Selectors', () =>
  testSelectorsSnapshotWithFixtures(fixtures));

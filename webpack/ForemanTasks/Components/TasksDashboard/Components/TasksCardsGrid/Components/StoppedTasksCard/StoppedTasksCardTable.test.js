import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { StoppedTable } from './StoppedTasksCardTable';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
} from '../../../../TasksDashboardConstants';

const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
const { LAST } = TASKS_DASHBOARD_AVAILABLE_QUERY_MODES;
const { WEEK } = TASKS_DASHBOARD_AVAILABLE_TIMES;
const data = {
  error: { total: 9, last: 1 },
  warning: { total: 8, last: 2 },
  success: { total: 7, last: 3 },
};
const fixtures = {
  'render with props': {
    data,
    time: WEEK,
    query: {},
    updateQuery: jest.fn(),
  },
};

Object.values(TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS)
  .filter(result => result !== TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS.OTHER)
  .forEach(result => {
    fixtures[`render ${result}-total selected`] = {
      query: {
        state: STOPPED,
        result,
      },
      updateQuery: jest.fn(),
      data,
      time: WEEK,
    };
    fixtures[`render ${result}-last selected`] = {
      time: WEEK,
      query: {
        state: STOPPED,
        result,
        mode: LAST,
        time: WEEK,
      },
      updateQuery: jest.fn(),
      data,
    };
  });

describe('StoppedTable', () =>
  testComponentSnapshotsWithFixtures(StoppedTable, fixtures));

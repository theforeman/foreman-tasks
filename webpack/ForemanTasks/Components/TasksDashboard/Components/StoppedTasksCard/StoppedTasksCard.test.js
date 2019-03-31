import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
} from '../../TasksDashboardConstants';
import StoppedTasksCard from './StoppedTasksCard';

const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
const { LAST } = TASKS_DASHBOARD_AVAILABLE_QUERY_MODES;
const { WEEK } = TASKS_DASHBOARD_AVAILABLE_TIMES;

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    data: {
      error: { total: 9, last: 1 },
      warning: { total: 8, last: 2 },
      success: { total: 7, last: 3 },
    },
    time: WEEK,
  },
  'render selected': {
    query: { state: STOPPED },
  },
};

Object.values(TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS).forEach(result => {
  fixtures[`render ${result}-total selected`] = {
    query: {
      state: STOPPED,
      result,
    },
  };
  fixtures[`render ${result}-last selected`] = {
    time: WEEK,
    query: {
      state: STOPPED,
      result,
      mode: LAST,
      time: WEEK,
    },
  };
});

describe('StoppedTasksCard', () =>
  testComponentSnapshotsWithFixtures(StoppedTasksCard, fixtures));

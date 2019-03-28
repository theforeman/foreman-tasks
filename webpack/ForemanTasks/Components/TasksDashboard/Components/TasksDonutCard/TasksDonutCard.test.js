import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../TasksDashboardConstants';
import TasksDonutCard from './TasksDonutCard';

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    title: 'some title',
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    wantedQueryState: 'some-state',
    className: 'some-classname',
    data: { last: 3, older: 5 },
  },
  'render with total selected': {
    wantedQueryState: 'some-state',
    query: { state: 'some-state' },
  },
  'render with last selected': {
    wantedQueryState: 'some-state',
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    query: {
      state: 'some-state',
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.LAST,
      time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    },
  },
  'render with older selected': {
    wantedQueryState: 'some-state',
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    query: {
      state: 'some-state',
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.OLDER,
      time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    },
  },
};

describe('TasksDonutCard', () =>
  testComponentSnapshotsWithFixtures(TasksDonutCard, fixtures));

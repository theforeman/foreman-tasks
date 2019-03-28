import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../TasksDashboardConstants';
import { MOCKED_DATA } from './TasksCardsGrid.fixtures';
import TasksCardsGrid from './TasksCardsGrid';

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    query: { state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING },
    data: MOCKED_DATA,
    updateQuery: jest.fn(),
  },
};

describe('TasksCardsGrid', () =>
  testComponentSnapshotsWithFixtures(TasksCardsGrid, fixtures));

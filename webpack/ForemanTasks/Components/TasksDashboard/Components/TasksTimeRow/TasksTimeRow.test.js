import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksTimeRow from './TasksTimeRow';

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    updateTime: jest.fn(),
  },
};

describe('TasksTimeRow', () =>
  testComponentSnapshotsWithFixtures(TasksTimeRow, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../../../TasksDashboardConstants';
import StoppedTasksCard from './StoppedTasksCard';

const { STOPPED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;

const fixtures = {
  'render with minimal props': {},
  'render selected': {
    query: { state: STOPPED },
  },
};

describe('StoppedTasksCard', () =>
  testComponentSnapshotsWithFixtures(StoppedTasksCard, fixtures));

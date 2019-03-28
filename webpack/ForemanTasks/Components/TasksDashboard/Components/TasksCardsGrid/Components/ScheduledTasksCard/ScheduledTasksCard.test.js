import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../../../TasksDashboardConstants';
import ScheduledTasksCard from './ScheduledTasksCard';

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    data: 3,
    className: 'some-class',
  },
  'render selected': {
    query: { state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED },
  },
};

describe('ScheduledTasksCard', () =>
  testComponentSnapshotsWithFixtures(ScheduledTasksCard, fixtures));

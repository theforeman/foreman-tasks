import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import ScheduledTasksCard from './ScheduledTasksCard';

const fixtures = {
  'render with props': { scheduled: 1, onClick: () => null },
};

describe('ScheduledTasksCard', () =>
  testComponentSnapshotsWithFixtures(ScheduledTasksCard, fixtures));

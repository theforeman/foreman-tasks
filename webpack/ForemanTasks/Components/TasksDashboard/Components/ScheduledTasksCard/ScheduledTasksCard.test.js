import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import ScheduledTasksCard from './ScheduledTasksCard';

const createRequiredProps = () => ({
  scheduled: 1,
});

const fixtures = {
  'render with minimal props': {},
  'render with props': { ...createRequiredProps() },
};

describe('ScheduledTasksCard', () =>
  testComponentSnapshotsWithFixtures(ScheduledTasksCard, fixtures));

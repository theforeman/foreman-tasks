import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import RunningTasksCard from './RunningTasksCard';

const fixtures = {
  'render with minimal props': {},
  'render with some props': { some: 'prop' },
};

describe('RunningTasksCard', () =>
  testComponentSnapshotsWithFixtures(RunningTasksCard, fixtures));

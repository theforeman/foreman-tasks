import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import RunningTasksCard from './RunningTasksCard';

const fixtures = {
  'render with minimal props': {},
  'render with some props': { some: 'prop' },
};

describe('RunningTasksCard', () =>
  testComponentSnapshotsWithFixtures(RunningTasksCard, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import PausedTasksCard from './PausedTasksCard';

const fixtures = {
  'render with minimal props': {},
  'render with some props': { some: 'prop' },
};

describe('PausedTasksCard', () =>
  testComponentSnapshotsWithFixtures(PausedTasksCard, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import ForemanTasks from './ForemanTasks';

const fixtures = {
  'render without Props': {},
};

describe('ForemanTasks', () =>
  testComponentSnapshotsWithFixtures(ForemanTasks, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import TaskDetails from '../TaskDetails';

const fixtures = {
  'render without Props': {},
};

describe('TaskDetails', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TaskDetails, fixtures));
});

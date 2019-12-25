import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import TasksDashboard from '../TasksDashboard';

const fixtures = {
  'render without Props': { history: {} },
  /** fixtures, props for the component */
};

describe('TasksDashboard', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksDashboard, fixtures));
});

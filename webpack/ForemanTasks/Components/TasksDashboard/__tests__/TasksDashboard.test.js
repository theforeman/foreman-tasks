import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import TasksDashboard from '../TasksDashboard';

const fixtures = {
  'render without Props': { history: {} },
  /** fixtures, props for the component */
};

describe('TasksDashboard', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksDashboard, fixtures));
});

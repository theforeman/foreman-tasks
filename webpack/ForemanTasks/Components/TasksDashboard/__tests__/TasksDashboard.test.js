import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import TasksDashboard from '../TasksDashboard';
import { tasksDashboardProps } from '../TasksDashboard.fixtures';

const fixtures = {
  'render with Props': tasksDashboardProps,

  /** fixtures, props for the component */
};

describe('TasksDashboard', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksDashboard, fixtures));
});

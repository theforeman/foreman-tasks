import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import TaskDetails from '../TaskDetails';

const fixtures = {
  'render without Props': { id: 'test' },
};

describe('TaskDetails', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TaskDetails, fixtures));
});

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import TaskDetails from '../TaskDetails';
import { minProps } from './TaskDetails.fixtures';

const fixtures = {
  'render with loading Props': { ...minProps, status: 'PENDING' },
  'render with min Props': minProps,
};

delete window.location;
window.location = new URL(
  'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
);

describe('TaskDetails', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TaskDetails, fixtures));
});

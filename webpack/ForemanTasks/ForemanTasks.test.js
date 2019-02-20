import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import ForemanTasks from './ForemanTasks';

const fixtures = {
  'render without Props': {},
};

describe('ForemanTasks', () =>
  testComponentSnapshotsWithFixtures(ForemanTasks, fixtures));

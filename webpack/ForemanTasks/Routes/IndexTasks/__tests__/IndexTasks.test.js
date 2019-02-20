import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import IndexTasks from '../IndexTasks';

const fixtures = {
  'render without Props': {},
};

describe('IndexTasks', () =>
  testComponentSnapshotsWithFixtures(IndexTasks, fixtures));

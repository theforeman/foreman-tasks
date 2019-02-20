import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import ShowTask from '../ShowTask';

const fixtures = {
  'render without Props': {},
};

describe('ShowTask', () =>
  testComponentSnapshotsWithFixtures(ShowTask, fixtures));

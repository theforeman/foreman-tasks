import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import ShowTask from '../ShowTask';

const fixtures = {
  'render without Props': {
    history: {
      push: jest.fn(),
    },
  },
};

describe('ShowTask', () =>
  testComponentSnapshotsWithFixtures(ShowTask, fixtures));

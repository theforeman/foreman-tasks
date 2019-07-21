import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import IndexTasks from '../IndexTasks';

const fixtures = {
  'render without Props': {
    history: {
      push: jest.fn(),
    },
  },
};

describe('IndexTasks', () =>
  testComponentSnapshotsWithFixtures(IndexTasks, fixtures));

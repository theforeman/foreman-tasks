import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import Locks from '../Locks';

const fixtures = {
  'render without Props': {},
  'render with Props': {
    locks: [
      {
        name: 'task_owner',
        exclusive: false,
        resource_type: 'User',
        resource_id: 4,
      },
      {
        name: 'task_owner2',
        exclusive: false,
        resource_type: 'User',
        resource_id: 2,
      },
    ],
  },
};

describe('Locks', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(Locks, fixtures));
});

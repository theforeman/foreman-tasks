import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import Task from '../Task';

const fixtures = {
  'render without Props': { id: 'test' },
  'render with some Props': {
    id: 'test',
    state: 'paused',
    hasSubTasks: true,
    allowDangerousActions: true,
  },
};

describe('Task', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(Task, fixtures));
});

import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { Cancel } from './Cancel';

const fixtures = {
  'render with cancellable true props': {
    id: 'id',
    name: 'some-name',
    cancellable: true,
    cancelTaskAction: jest.fn(),
  },
  'render with cancellable false props': {
    id: 'id',
    name: 'some-name',
    cancellable: false,
    cancelTaskAction: jest.fn(),
  },
};

describe('Cancel', () => testComponentSnapshotsWithFixtures(Cancel, fixtures));

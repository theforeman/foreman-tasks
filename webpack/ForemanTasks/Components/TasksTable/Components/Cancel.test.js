import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { Cancel } from './Cancel';

const fixtures = {
  'render with cancellable true props': { id: 'id', cancellable: true },
  'render with cancellable false props': { id: 'id', cancellable: false },
};

describe('Cancel', () => testComponentSnapshotsWithFixtures(Cancel, fixtures));

import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import Raw from '../Raw';

const fixtures = {
  'render without Props': {},
  'render with Props': {
    startedAt: '2019-06-17 16:04:09 +0300',
    endedAt: '2019-06-17 16:05:09 +0300',
    id: '6b0d6db2-e9ab-40da-94e5-b6842ac50bd0',
    label: 'Actions::Katello::EventQueue::Monitor',
    input: {
      locale: 'en',
      current_request_id: 1,
      current_user_id: 4,
      current_organization_id: 2,
      current_location_id: 3,
    },
    output: {},
    externalId: 'test',
  },
};

describe('Raw', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(Raw, fixtures));
});

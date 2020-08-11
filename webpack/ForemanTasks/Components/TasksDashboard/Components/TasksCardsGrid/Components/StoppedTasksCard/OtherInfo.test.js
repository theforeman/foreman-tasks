import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { OtherInfo } from './OtherInfo';

const fixtures = {
  render: {
    updateQuery: jest.fn,
    otherCount: 7,
    query: { state: 'STOPPED', result: 'OTHER' },
  },
};

describe('OtherInfo', () =>
  testComponentSnapshotsWithFixtures(OtherInfo, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { SelectAllAlert } from '../SelectAllAlert';

const baseProps = {
  itemCount: 7,
  perPage: 5,
  selectAllRows: jest.fn(),
  unselectAllRows: jest.fn(),
};
const fixtures = {
  'renders SelectAllAlert with perPage > itemCout': {
    allRowsSelected: false,
    itemCount: 7,
    perPage: 10,
    ...baseProps,
  },
  'renders SelectAllAlert without all rows selected': {
    allRowsSelected: false,
    ...baseProps,
  },
  'renders SelectAllAlert with all rows selected': {
    allRowsSelected: true,
    ...baseProps,
  },
};

describe('SelectAllAlert', () =>
  testComponentSnapshotsWithFixtures(SelectAllAlert, fixtures));

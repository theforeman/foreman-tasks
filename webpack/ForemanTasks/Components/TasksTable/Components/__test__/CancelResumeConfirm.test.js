import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import { CancelResumeConfirm } from '../CancelResumeConfirm';
import { CANCEL, RESUME, CLOSED } from '../../TasksTableConstants';

const baseProps = {
  closeModal: () => null,
  selectedRowsLen: 3,
  action: () => null,
  selected: [1, 2, 3],
};
const fixtures = {
  'renders CANCEL modal': {
    ...baseProps,
    modalStatus: CANCEL,
  },
  'renders RESUME modal': {
    ...baseProps,
    modalStatus: RESUME,
  },
  'renders CLOSED modal': {
    ...baseProps,
    modalStatus: CLOSED,
  },
};

describe('CancelResumeConfirm', () =>
  testComponentSnapshotsWithFixtures(CancelResumeConfirm, fixtures));

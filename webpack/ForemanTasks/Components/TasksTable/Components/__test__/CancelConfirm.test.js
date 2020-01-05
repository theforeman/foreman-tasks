import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { CancelConfirm } from '../CancelConfirm';
import {
  CANCEL_CONFIRM_MODAL_ID,
  CANCEL_SELECTED_CONFIRM_MODAL_ID,
} from '../../TasksTableConstants';

const baseProps = {
  closeModal: () => null,
  selectedRowsLen: 1,
  action: () => null,
};
const fixtures = {
  'renders CANCEL modal': {
    ...baseProps,
    id: CANCEL_CONFIRM_MODAL_ID,
  },
  'renders CANCEL_SELECTED modal': {
    ...baseProps,
    id: CANCEL_SELECTED_CONFIRM_MODAL_ID,
  },
};

describe('CancelConfirm', () =>
  testComponentSnapshotsWithFixtures(CancelConfirm, fixtures));

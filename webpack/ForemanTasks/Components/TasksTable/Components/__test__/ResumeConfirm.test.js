import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { ResumeConfirm } from '../ResumeConfirm';
import {
  RESUME_CONFIRM_MODAL_ID,
  RESUME_SELECTED_CONFIRM_MODAL_ID,
} from '../../TasksTableConstants';

const baseProps = {
  closeModal: () => null,
  selectedRowsLen: 3,
  action: () => null,
};
const fixtures = {
  'renders RESUME modal': {
    ...baseProps,
    id: RESUME_CONFIRM_MODAL_ID,
  },
  'renders RESUME_SELECTED modal': {
    ...baseProps,
    id: RESUME_SELECTED_CONFIRM_MODAL_ID,
  },
};

describe('ResumeConfirm', () =>
  testComponentSnapshotsWithFixtures(ResumeConfirm, fixtures));

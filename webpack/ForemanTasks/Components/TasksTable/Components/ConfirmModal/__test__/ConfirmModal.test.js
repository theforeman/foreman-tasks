import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { ConfirmModal } from '../ConfirmModal';
import { RESUME_SELECTED_MODAL } from '../../../TasksTableConstants';

const fixtures = {
  'renders ConfirmModal': {
    tasksActions: {
      RESUME_SELECTED_MODAL: jest.fn(),
    },
    actionType: RESUME_SELECTED_MODAL,
    actionText: 'some text',
    actionState: 'some state',
    action: jest.fn(),
    selectedRowsLen: 1,
    id: 'modalID',
  },
};

describe('ConfirmModal', () =>
  testComponentSnapshotsWithFixtures(ConfirmModal, fixtures));

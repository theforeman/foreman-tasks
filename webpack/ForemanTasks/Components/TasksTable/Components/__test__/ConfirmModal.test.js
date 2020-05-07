import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { ConfirmModal } from '../ConfirmModal';

const fixtures = {
  'renders ConfirmModal': {
    closeModal: jest.fn(),
    actionText: 'some text',
    actionState: 'some state',
    action: jest.fn(),
    selectedRowsLen: 1,
    id: 'modalID',
  },
};

describe('ConfirmModal', () =>
  testComponentSnapshotsWithFixtures(ConfirmModal, fixtures));

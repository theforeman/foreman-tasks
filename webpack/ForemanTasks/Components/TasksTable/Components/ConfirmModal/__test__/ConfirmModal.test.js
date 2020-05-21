import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { ConfirmModal } from '../ConfirmModal';
import { RESUME_SELECTED_MODAL } from '../../../TasksTableConstants';

const fixtures = {
  'renders ConfirmModal': {
    actionType: RESUME_SELECTED_MODAL,
    actionText: 'some text',
    actionState: 'some state',
    selectedRowsLen: 1,
    id: 'modalID',
    parentTaskID: 'parent-id',
    allRowsSelected: true,
    url: 'some-url',
    uriQuery: { state: 'stopped' },
    setModalClosed: jest.fn(),
  },
};

describe('ConfirmModal', () => {
  testComponentSnapshotsWithFixtures(ConfirmModal, fixtures);
});

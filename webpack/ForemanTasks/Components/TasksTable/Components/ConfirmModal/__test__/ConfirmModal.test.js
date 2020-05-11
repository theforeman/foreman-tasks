import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { ConfirmModal } from '../ConfirmModal';
import { RESUME_SELECTED_MODAL } from '../../../TasksTableConstants';
import { FORCE_UNLOCK_MODAL } from '../../../../TaskActions/TaskActionsConstants';

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

  'renders ConfirmModal for unlock ': {
    actionType: FORCE_UNLOCK_MODAL,
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

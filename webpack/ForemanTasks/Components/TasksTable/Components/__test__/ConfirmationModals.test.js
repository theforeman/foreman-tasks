import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { CANCEL_SELECTED_MODAL, RESUME_MODAL } from '../../TasksTableConstants';
import { ConfirmationModals } from '../ConfirmationModals';

const fixtures = {
  'renders CANCEL_SELECTED_MODAL ConfirmationModals': {
    setModalClosed: jest.fn(),
    modalID: CANCEL_SELECTED_MODAL,
    selectedRowsLen: 7,
    tasksActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
      cancelSelectedTasks: jest.fn(),
      resumeSelectedTasks: jest.fn(),
    },
  },
  'renders RESUME_MODAL ConfirmationModals': {
    setModalClosed: jest.fn(),
    modalID: RESUME_MODAL,
    selectedRowsLen: 7,
    tasksActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
      cancelSelectedTasks: jest.fn(),
      resumeSelectedTasks: jest.fn(),
    },
  },

  'renders empty ConfirmationModals': {
    setModalClosed: jest.fn(),
    modalID: 'wrong-id',
    selectedRowsLen: 7,
    tasksActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
      cancelSelectedTasks: jest.fn(),
      resumeSelectedTasks: jest.fn(),
    },
  },
};

describe('ConfirmationModals', () =>
  testComponentSnapshotsWithFixtures(ConfirmationModals, fixtures));

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { ConfirmationModals } from '../ConfirmationModals';

const fixtures = {
  'renders ConfirmationModals': {
    modalProps: {
      cancelSelectedModal: { setModalClosed: jest.fn() },
      resumeSelectedModal: { setModalClosed: jest.fn() },
      cancelModal: { setModalClosed: jest.fn() },
      resumeModal: { setModalClosed: jest.fn() },
    },
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

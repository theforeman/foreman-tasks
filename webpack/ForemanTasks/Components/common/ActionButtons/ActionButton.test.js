import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import { ActionButton } from './ActionButton';

const fixtures = {
  'render with cancellable true props': {
    availableActions: {
      cancellable: true,
      resumable: false,
    },
    taskActions: {
      cancel: jest.fn(),
      resume: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
  'render with resumable true props': {
    availableActions: {
      cancellable: false,
      resumable: true,
    },
    taskActions: {
      cancel: jest.fn(),
      resume: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
  'render with cancellable false props': {
    availableActions: {
      cancellable: false,
      resumable: false,
    },
    taskActions: {
      cancel: jest.fn(),
      resume: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
};

describe('ActionButton', () =>
  testComponentSnapshotsWithFixtures(ActionButton, fixtures));

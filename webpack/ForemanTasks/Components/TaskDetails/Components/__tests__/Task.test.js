import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { STATUS } from 'foremanReact/constants';
import Task from '../Task';

const fixtures = {
  'render with minimal Props': {
    id: 'test',
    taskReloadStart: jest.fn(),
    taskProgressToggle: jest.fn(),
  },
  'render with some Props': {
    id: 'test',
    state: 'paused',
    hasSubTasks: true,
    dynflowEnableConsole: true,
    parentTask: 'parent-id',
    taskReload: true,
    canEdit: true,
    status: STATUS.RESOLVED,
    taskProgressToggle: jest.fn(),
    taskReloadStart: jest.fn(),
  },
};

describe('Task rendering', () =>
  testComponentSnapshotsWithFixtures(Task, fixtures));

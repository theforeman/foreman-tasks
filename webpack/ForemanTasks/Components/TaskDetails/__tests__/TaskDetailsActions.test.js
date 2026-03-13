import { testActionSnapshotWithFixtures } from '@theforeman/test';
import {
  taskReloadStop,
  taskReloadStart,
  cancelStep,
} from '../TaskDetailsActions';

jest.mock('foremanReact/components/ToastsList', () => ({
  addToast: toast => ({
    type: 'TOASTS_ADD',
    payload: {
      message: toast,
    },
  }),
}));

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(),
  'should cancelStep': () => cancelStep('task-id', 'step-id'),
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

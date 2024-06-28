import { testActionSnapshotWithFixtures } from '@theforeman/test';
import {
  taskReloadStop,
  taskReloadStart,
  cancelStep,
} from '../TaskDetailsActions';

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(),
  'should cancelStep': () => cancelStep('task-id', 'step-id'),
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

import { testActionSnapshotWithFixtures } from '@theforeman/test';
import { API } from 'foremanReact/redux/API';
import {
  taskReloadStop,
  taskReloadStart,
  fetchTaskDetails,
  cancelStep,
} from '../TaskDetailsActions';

jest.mock('foremanReact/redux/API');

API.post.mockImplementation(async () => ({ data: 'some-data' }));

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(),
  'should fetch-task-details and success': () => fetchTaskDetails(2),
  'should cancelStep': () => cancelStep('task-id', 'step-id'),
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

import { testActionSnapshotWithFixtures } from '@theforeman/test';
import { API } from 'foremanReact/redux/API';
import {
  taskReloadStop,
  taskReloadStart,
  fetchTaskDetails,
} from '../TaskDetailsActions';

jest.mock('foremanReact/redux/API');

API.get.mockImplementation(async () => ({ data: 'some-data' }));

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(2),
  'should fetch-task-details and success': () => fetchTaskDetails(),
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

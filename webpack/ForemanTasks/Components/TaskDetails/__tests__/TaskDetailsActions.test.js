import { testActionSnapshotWithFixtures } from 'react-redux-test-utils';
import API from 'foremanReact/API';
import {
  taskReloadStop,
  taskReloadStart,
  fetchTaskDetails,
} from '../TaskDetailsActions';

jest.mock('foremanReact/API');

API.get.mockImplementation(async () => ({ data: 'some-data' }));

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(2),
  'should fetch-task-details and success': () => fetchTaskDetails(),
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

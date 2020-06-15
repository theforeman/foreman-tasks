import { testActionSnapshotWithFixtures } from '@theforeman/test';
import API from 'foremanReact/API';
import {
  taskReloadStop,
  taskReloadStart,
  fetchTaskDetails,
  cancelStep,
} from '../TaskDetailsActions';

jest.mock('foremanReact/API');

API.get.mockImplementation(async () => ({ data: 'some-data' }));
API.post.mockImplementation(async () => ({ data: 'some-data' }));

const fixtures = {
  'should start reload': () => taskReloadStart(1),
  'should stop reload': () => taskReloadStop(2),
  'should fetch-task-details and success': () => fetchTaskDetails(),
  'should cancelStep and success': () => cancelStep('task-id', 'step-id'),

  'should fetch-task-details and fail': () => {
    API.get.mockImplementationOnce(() =>
      Promise.reject(new Error('Network Error'))
    );
    return fetchTaskDetails();
  },
  'should cancelStep and fail': () => {
    API.post.mockImplementationOnce(() =>
      Promise.reject(new Error('Network Error'))
    );
    return cancelStep('task-id', 'step-id');
  },
};

describe('TaskDetails - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

import { testActionSnapshotWithFixtures } from '@theforeman/test';
import API from 'foremanReact/API';
import { cancelTaskRequest, resumeTaskRequest } from './';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/API');

const task = ['some-id', 'some-name'];

const fixtures = {
  'should cancelTaskRequest and succeed': () => cancelTaskRequest(...task),
  'should cancelTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return cancelTaskRequest(...task);
  },

  'should resumeTaskRequest and succeed': () => {
    API.post.mockImplementation(() => ({ data: 'some-data' }));
    return resumeTaskRequest(...task);
  },
  'should resumeTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return resumeTaskRequest(...task);
  },
};
describe('Tasks actions', () => {
  testActionSnapshotWithFixtures(fixtures);
});

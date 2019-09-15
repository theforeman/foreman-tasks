import { testActionSnapshotWithFixtures } from 'react-redux-test-utils';
import API from 'foremanReact/API';
import { TASKS_TABLE_ID } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTask,
  cancelTaskRequest,
  resumeTask,
  resumeTaskRequest,
} from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/API');

API.post.mockImplementation(() => ({ data: 'some-data' }));

const fixtures = {
  'should cancelTask': () => cancelTask('some-id', 'some-name', 'some-url'),
  'should cancelTaskRequest and succeed': () =>
    cancelTaskRequest('some-id', 'some-name', 'some-url'),
  'should cancelTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return cancelTaskRequest('some-id', 'some-name');
  },

  'should resumeTask': () => resumeTask('some-id', 'some-name', 'some-url'),
  'should resumeTaskRequest and succeed': () => {
    API.post.mockImplementation(() => ({ data: 'some-data' }));
    return resumeTaskRequest('some-id', 'some-name', 'some-url');
  },
  'should resumeTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return resumeTaskRequest('some-id', 'some-name', 'some-url');
  },
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
  testActionSnapshotWithFixtures(fixtures);
});

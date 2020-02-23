import { testActionSnapshotWithFixtures } from '@theforeman/test';
import API from 'foremanReact/API';
import { TASKS_TABLE_ID } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTask,
  cancelTaskRequest,
  resumeTask,
  resumeTaskRequest,
  bulkCancel,
  bulkResume,
} from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/API');

API.post.mockImplementation(() => ({ data: 'some-data' }));

const taskInfo = {
  taskId: 'some-id',
  taskName: 'some-name',
};

const task = {
  id: 'some-id',
  name: 'some-name',
};

const fixtures = {
  'should cancelTask': () => cancelTask({ ...taskInfo, url: 'some-url' }),
  'should cancelTaskRequest and succeed': () =>
    cancelTaskRequest('some-id', 'some-name'),
  'should cancelTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return cancelTaskRequest('some-id', 'some-name');
  },

  'should resumeTask': () => resumeTask({ ...taskInfo, url: 'some-url' }),
  'should resumeTaskRequest and succeed': () => {
    API.post.mockImplementation(() => ({ data: 'some-data' }));
    return resumeTaskRequest('some-id', 'some-name');
  },
  'should resumeTaskRequest and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return resumeTaskRequest('some-id', 'some-name');
  },
  'handles bulkResume requests that fail': () => {
    const selected = [{ ...task, isResumable: true, isCancellable: false }];

    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return bulkResume({ selected, url: 'some-url' });
  },
  'handles resumable bulkResume requests': () => {
    const selected = [{ ...task, isResumable: true, isCancellable: false }];

    API.post.mockImplementation(() => ({
      data: {
        resumed: [{ action: 'I am resumed' }],
        failed: [{ action: 'I am failed' }],
      },
    }));
    return bulkResume({ selected, url: 'some-url' });
  },
  'handles bulkCancel requests': () => {
    const selected = [{ ...task, isResumable: false, isCancellable: true }];
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles bulkCancel requests that are not cancellable': () => {
    const selected = [{ ...task, isResumable: false, isCancellable: false }];
    return bulkCancel({ selected, url: 'some-url' });
  },
  'handles bulkResume requests that are not resumable': () => {
    const selected = [{ ...task, isResumable: false, isCancellable: false }];
    return bulkResume({ selected, url: 'some-url' });
  },
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
  testActionSnapshotWithFixtures(fixtures);
});

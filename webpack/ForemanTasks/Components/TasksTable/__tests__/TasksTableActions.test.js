import { testActionSnapshotWithFixtures } from 'react-redux-test-utils';
import API from 'foremanReact/API';
import { TASKS_TABLE_ID, CANCEL, RESUME } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTask,
  cancelTaskRequest,
  resumeTask,
  resumeTaskRequest,
  actionSelected,
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
  'should actionSelected CANCEL not cancelleble': () => {
    const selected = [
      {
        id: '',
        name: '',
        isResumeble: false,
        isCancelleble: false,
      },
    ];
    return actionSelected(CANCEL, selected, 'some-url');
  },
  'should actionSelected CANCEL cancelleble': () => {
    const selected = [
      {
        id: '',
        name: '',
        isResumeble: false,
        isCancelleble: true,
      },
    ];
    return actionSelected(CANCEL, selected, 'some-url');
  },
  'should actionSelected RESUME not resumable': () => {
    const selected = [
      {
        id: '',
        name: '',
        isResumeble: false,
        isCancelleble: false,
      },
    ];
    return actionSelected(RESUME, selected, 'some-url');
  },
  'should actionSelected RESUME resumable': () => {
    const selected = [
      {
        id: '',
        name: '',
        isResumeble: true,
        isCancelleble: false,
      },
    ];
    return actionSelected(RESUME, selected, 'some-url');
  },
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
  testActionSnapshotWithFixtures(fixtures);
});

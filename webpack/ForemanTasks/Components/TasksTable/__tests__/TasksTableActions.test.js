import { testActionSnapshotWithFixtures } from 'react-redux-test-utils';
import API from 'foremanReact/API';
import { TASKS_TABLE_ID } from '../TasksTableConstants';
import {
  getTableItems,
  cancelTaskAction,
  cancelTask,
} from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/API');

API.post.mockImplementation(() => ({ data: 'some-data' }));

const fixtures = {
  'should cancelTaskAction': () =>
    cancelTaskAction('some-id', 'some-name', 'some-url'),
  'should cancelTask and succeed': () =>
    cancelTask('some-id', 'some-name', 'some-url'),
  'should cancelTask and fail': () => {
    API.post.mockImplementation(() =>
      Promise.reject(new Error('Network Error'))
    );
    return cancelTask('some-id', 'some-name');
  },
};
describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
  testActionSnapshotWithFixtures(fixtures);
});

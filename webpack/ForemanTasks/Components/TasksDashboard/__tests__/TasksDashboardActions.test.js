import { testActionSnapshotWithFixtures } from 'react-redux-test-utils';
import API from 'foremanReact/API';
import { timeToHoursNumber } from '../TasksDashboardHelper';
import {
  initializeDashboard,
  updateTime,
  updateQuery,
  fetchTasksSummary,
} from '../TasksDashboardActions';

jest.mock('foremanReact/API');
jest.mock('../TasksDashboardHelper');

const correctTime = 'H24';
const wrongTime = 'H25';

timeToHoursNumber.mockImplementation(arg => arg);
API.get.mockImplementation(async path => {
  if (path === `/foreman_tasks/tasks/summary/${correctTime}`) {
    return { data: 'some-data' };
  }

  throw new Error('wrong time');
});

const fixtures = {
  'should initialize-dashboard': () =>
    initializeDashboard({ time: 'some-time', query: 'some-query' }),
  'should update-time': () => updateTime('some-time'),
  'should update-query': () => updateQuery('some-query', jest.fn()),
  'should fetch-tasks-summary and success': () =>
    fetchTasksSummary(correctTime),
  'should fetch-tasks-summary and fail': () => fetchTasksSummary(wrongTime),
};

describe('TasksDashboard - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

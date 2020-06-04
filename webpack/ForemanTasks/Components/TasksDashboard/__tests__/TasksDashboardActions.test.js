import { testActionSnapshotWithFixtures } from '@theforeman/test';
import { API } from 'foremanReact/redux/API';
import { timeToHoursNumber } from '../TasksDashboardHelper';
import {
  initializeDashboard,
  updateTime,
  updateQuery,
  fetchTasksSummary,
} from '../TasksDashboardActions';
import {
  correctTime,
  wrongTime,
  parentTaskID,
  apiGetMock,
} from './TaskDashboard.fixtures';

jest.mock('foremanReact/redux/API');
jest.mock('../TasksDashboardHelper');

timeToHoursNumber.mockImplementation(arg => arg);
API.get.mockImplementation(apiGetMock);

const fixtures = {
  'should initialize-dashboard': () =>
    initializeDashboard({ time: 'some-time', query: 'some-query' }),
  'should update-time': () => updateTime('some-time'),
  'should update-query': () => updateQuery('some-query'),
  'should fetch-tasks-summary and success': () =>
    fetchTasksSummary(correctTime),
  'should fetch-tasks-summary for subtasks and success': () =>
    fetchTasksSummary(correctTime, parentTaskID),
  'should fetch-tasks-summary and fail': () => fetchTasksSummary(wrongTime),
};

describe('TasksDashboard - Actions', () =>
  testActionSnapshotWithFixtures(fixtures));

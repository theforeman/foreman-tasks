import { API } from 'foremanReact/redux/API';
import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
} from '../TasksDashboardConstants';
import { timeToHoursNumber, resolveQuery } from '../TasksDashboardHelper';
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
  taskSummary,
  subtaskSummary,
} from './TaskDashboard.fixtures';

jest.mock('foremanReact/redux/API');
jest.mock('../TasksDashboardHelper');

timeToHoursNumber.mockImplementation(arg => arg);
resolveQuery.mockImplementation(() => {});
API.get.mockImplementation(apiGetMock);

describe('TasksDashboard - Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    timeToHoursNumber.mockImplementation(arg => arg);
    resolveQuery.mockImplementation(() => {});
    API.get.mockImplementation(apiGetMock);
  });

  it('should initialize-dashboard', () => {
    expect(
      initializeDashboard({ time: 'some-time', query: 'some-query' })
    ).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_INIT,
      payload: { time: 'some-time', query: 'some-query' },
    });
  });

  it('should update-time', () => {
    expect(updateTime('some-time')).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
      payload: 'some-time',
    });
  });

  it('should update-query', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const history = { push: jest.fn(), replace: jest.fn() };
    const query = { state: 'running' };

    updateQuery(query, history)(dispatch, getState);

    expect(resolveQuery).toHaveBeenCalledWith(query, history);
    expect(dispatch).toHaveBeenCalledWith({
      type: FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
      payload: query,
    });
  });

  it('should fetch-tasks-summary and success', async () => {
    const dispatch = jest.fn();

    await fetchTasksSummary(correctTime)(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
      payload: taskSummary,
    });
  });

  it('should fetch-tasks-summary for subtasks and success', async () => {
    const dispatch = jest.fn();

    await fetchTasksSummary(correctTime, parentTaskID)(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
      payload: subtaskSummary,
    });
  });

  it('should fetch-tasks-summary and fail', async () => {
    const dispatch = jest.fn();

    await fetchTasksSummary(wrongTime)(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
    });
    expect(dispatch.mock.calls[1][0].type).toBe(
      FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE
    );
    expect(dispatch.mock.calls[1][0].payload).toEqual(expect.any(Error));
    expect(dispatch.mock.calls[1][0].payload.message).toBe('wrong time');
  });
});

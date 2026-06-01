import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_SUMMARY_ZERO,
} from '../TasksDashboardConstants';
import reducer from '../TasksDashboardReducer';

const initialState = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  isLoadingTasksSummary: false,
  error: null,
  tasksSummary: TASKS_SUMMARY_ZERO,
};

describe('TasksDashboard reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_INIT', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_INIT,
      })
    ).toEqual({
      ...initialState,
      query: undefined,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_INIT with data', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_INIT,
        payload: { time: 'some-time', query: 'some-query' },
      })
    ).toEqual({
      ...initialState,
      time: 'some-time',
      query: 'some-query',
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_UPDATE_TIME', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
        payload: 'some-time',
      })
    ).toEqual({
      ...initialState,
      time: 'some-time',
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
        payload: 'some-query',
      })
    ).toEqual({
      ...initialState,
      query: 'some-query',
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
      })
    ).toEqual({
      ...initialState,
      isLoading: true,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS', () => {
    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
        payload: 'some-payload',
      })
    ).toEqual({
      ...initialState,
      tasksSummary: 'some-payload',
      isLoading: false,
      error: null,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE', () => {
    const error = new Error('some error');

    expect(
      reducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
        payload: error,
      })
    ).toEqual({
      ...initialState,
      tasksSummary: TASKS_SUMMARY_ZERO,
      isLoading: false,
      error,
    });
  });
});

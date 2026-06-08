import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_SUMMARY_ZERO,
} from '../TasksDashboardConstants';
import reducer from '../TasksDashboardReducer';

const dashboardQuery = {
  state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING,
};

const initialState = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  isLoadingTasksSummary: false,
  error: null,
  tasksSummary: TASKS_SUMMARY_ZERO,
};

const runReducer = (state, action) =>
  reducer(state, action).asMutable({ deep: true });

describe('TasksDashboard reducer', () => {
  it('should return the initial state', () => {
    expect(runReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_INIT', () => {
    expect(
      runReducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_INIT,
      })
    ).toEqual({
      ...initialState,
      query: undefined,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_INIT with data', () => {
    expect(
      runReducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_INIT,
        payload: {
          time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
          query: dashboardQuery,
        },
      })
    ).toEqual({
      ...initialState,
      time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
      query: dashboardQuery,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_UPDATE_TIME', () => {
    expect(
      runReducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
        payload: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
      })
    ).toEqual({
      ...initialState,
      time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY', () => {
    expect(
      runReducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
        payload: dashboardQuery,
      })
    ).toEqual({
      ...initialState,
      query: dashboardQuery,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST', () => {
    expect(
      runReducer(undefined, {
        type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
      })
    ).toEqual({
      ...initialState,
      isLoading: true,
    });
  });

  it('should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS', () => {
    expect(
      runReducer(undefined, {
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
      runReducer(undefined, {
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

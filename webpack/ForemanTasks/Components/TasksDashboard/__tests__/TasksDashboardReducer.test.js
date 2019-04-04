import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';

import {
  FOREMAN_TASKS_DASHBOARD_INIT,
  FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
  FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
  FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
} from '../TasksDashboardConstants';
import reducer from '../TasksDashboardReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle FOREMAN_TASKS_DASHBOARD_INIT': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_INIT,
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_INIT with data': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_INIT,
      payload: { time: 'some-time', query: 'some-query' },
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_UPDATE_TIME': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_UPDATE_TIME,
      payload: 'some-time',
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_UPDATE_QUERY,
      payload: 'some-query',
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_REQUEST,
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_SUCCESS,
      payload: 'some-payload',
    },
  },
  'should handle FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE': {
    action: {
      type: FOREMAN_TASKS_DASHBOARD_FETCH_TASKS_SUMMARY_FAILURE,
      payload: new Error('some error'),
    },
  },
};

describe('BreadcrumbBar reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';

import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_STOP_PULLING,
  FOREMAN_TASK_DETAILS_START_PULLING,
} from '../TaskDetailsConstants';
import reducer from '../TaskDetailsReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle FOREMAN_TASK_DETAILS_START_PULLING': {
    action: {
      type: FOREMAN_TASK_DETAILS_START_PULLING,
      payload: { timeoutId: 1 },
    },
  },
  'should handle FOREMAN_TASK_DETAILS_STOP_PULLING': {
    action: {
      type: FOREMAN_TASK_DETAILS_STOP_PULLING,
      payload: { timeoutId: 1 },
    },
  },
  'should handle FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS': {
    action: {
      type: FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
      payload: { data: 'some-payload' },
    },
  },
};

describe('TaskDetails - Reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

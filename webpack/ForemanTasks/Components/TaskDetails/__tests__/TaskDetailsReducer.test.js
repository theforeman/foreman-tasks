import { testReducerSnapshotWithFixtures } from '@theforeman/test';

import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_STOP_POLLING,
  FOREMAN_TASK_DETAILS_START_POLLING,
} from '../TaskDetailsConstants';
import reducer from '../TaskDetailsReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle FOREMAN_TASK_DETAILS_START_POLLING': {
    action: {
      type: FOREMAN_TASK_DETAILS_START_POLLING,
      payload: { timeoutId: 1 },
    },
  },
  'should handle FOREMAN_TASK_DETAILS_STOP_POLLING': {
    action: {
      type: FOREMAN_TASK_DETAILS_STOP_POLLING,
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

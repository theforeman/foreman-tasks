import { testReducerSnapshotWithFixtures } from '@theforeman/test';

import { FOREMAN_TASK_DETAILS_SUCCESS } from '../TaskDetailsConstants';
import reducer from '../TaskDetailsReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle FOREMAN_TASK_DETAILS_SUCCESS': {
    action: {
      type: FOREMAN_TASK_DETAILS_SUCCESS,
    },
  },
};

describe('TaskDetails - Reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

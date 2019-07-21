import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';
import {
  TASKS_TABLE_SUCCESS,
  TASKS_TABLE_PENDING,
} from '../TasksTableConstants';
import reducer from '../TasksTableReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle TASKS_TABLE_SUCCESS': {
    action: {
      type: TASKS_TABLE_SUCCESS,
      payload: {
        subtotal: 120,
        page: 3,
        per_page: 10,
      },
    },
  },
  'should handle TASKS_TABLE_PENDING': {
    action: {
      type: TASKS_TABLE_PENDING,
    },
  },
};

describe('TasksTablePaginationReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

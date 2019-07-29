import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';
import {
  TASKS_TABLE_SUCCESS,
  TASKS_TABLE_REQUEST,
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
        per_page: 12,
      },
    },
  },
  'should handle TASKS_TABLE_REQUEST': {
    action: {
      type: TASKS_TABLE_REQUEST,
    },
  },
};

describe('TasksTablePaginationReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

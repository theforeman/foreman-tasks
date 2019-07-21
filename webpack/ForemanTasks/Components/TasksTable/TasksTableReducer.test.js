import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';
import { TASKS_TABLE_SUCCESS } from './TasksTableConstants';
import reducer from './TasksTableReducer';

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
};

describe('TasksTablePaginationReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

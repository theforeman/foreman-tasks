import { testReducerSnapshotWithFixtures } from 'react-redux-test-utils';
import {
  TASKS_TABLE_ID,
  TASKS_TABLE_SET_SORT,
  TASKS_TABLE_SET_PAGINATION,
} from '../TasksTableConstants';
import reducer from '../TasksTableReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle TASKS_TABLE_SUCCESS': {
    action: {
      type: `${TASKS_TABLE_ID}_SUCCESS`,
      payload: {
        subtotal: 120,
        page: 3,
        per_page: 12,
      },
    },
  },
  'should handle TASKS_TABLE_SET_SORT': {
    action: {
      type: TASKS_TABLE_SET_SORT,
      payload: { by: 'a', order: 'b' },
    },
  },

  'should handle TASKS_TABLE_SET_PAGINATION': {
    action: {
      type: TASKS_TABLE_SET_PAGINATION,
      payload: { page: 4, perPage: 7 },
    },
  },
};

describe('TasksTablePaginationReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

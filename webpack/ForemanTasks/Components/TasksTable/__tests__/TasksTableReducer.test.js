import { testReducerSnapshotWithFixtures } from '@theforeman/test';
import {
  TASKS_TABLE_ID,
  TASKS_TABLE_SET_SORT,
  TASKS_TABLE_SET_PAGINATION,
  SELECT_ROWS,
  UNSELECT_ROWS,
  UNSELECT_ALL_ROWS,
  TASKS_TABLE_SELECTED_MODAL,
  RESUME,
} from '../TasksTableConstants';
import reducer from '../TasksTableReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle TASKS_TABLE_SUCCESS': {
    action: {
      type: `${TASKS_TABLE_ID}_SUCCESS`,
      response: {
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
  'should handle SELECT_ROWS': {
    action: {
      type: SELECT_ROWS,
      payload: [1, 2, 3, 4, 5, 6, 7],
    },
  },
  'should handle UNSELECT_ROWS': {
    action: {
      type: UNSELECT_ROWS,
      payload: 4,
    },
  },
  'should handle UNSELECT_ALL_ROWS': {
    action: {
      type: UNSELECT_ALL_ROWS,
    },
  },
  'should handle TASKS_TABLE_SELECTED_MODAL': {
    action: {
      type: TASKS_TABLE_SELECTED_MODAL,
      payload: RESUME,
    },
  },
};

describe('TasksTableReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

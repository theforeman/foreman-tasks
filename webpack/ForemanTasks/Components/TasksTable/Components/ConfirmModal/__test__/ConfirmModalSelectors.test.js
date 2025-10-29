import { testSelectorsSnapshotWithFixtures } from '@theforeman/test';
import {
  selectClicked,
  selectSelectedTasks,
  selectSelectedRowsLen,
} from '../ConfirmModalSelectors';
import { CANCEL_MODAL } from '../../../TasksTableConstants';

const state = {
  foremanTasks: {
    tasksTable: {
      tasksTableContent: {
        results: [
          {
            id: 1,
            action: 'action1',
            available_actions: { cancellable: true },
            can_edit: true,
          },
          { id: 2, action: 'action2', available_actions: { resumable: true } },
        ],
        itemCount: 10,
      },
      tasksTableQuery: {
        selectedRows: [1, 2, 3],
        clicked: { taskId: '1', taskName: 'test-task' },
        allRowsSelected: false,
      },
    },
  },
};

const fixtures = {
  'should select clicked': () => selectClicked(state),
  'should select selectedTasks': () => selectSelectedTasks(state),
  'should select selectedRowsLen 1': () =>
    selectSelectedRowsLen({
      ...state,
      foremanTasks: {
        tasksTable: {
          ...state.foremanTasks.tasksTable,
          tasksTableQuery: {
            ...state.foremanTasks.tasksTable.tasksTableQuery,
            clicked: { modalType: CANCEL_MODAL },
          },
        },
      },
    }),
  'should select selectedRowsLen all': () => selectSelectedRowsLen(state),
  'should select selectedRowsLen some': () =>
    selectSelectedRowsLen({
      ...state,
      foremanTasks: {
        tasksTable: {
          ...state.foremanTasks.tasksTable,
          tasksTableQuery: {
            ...state.foremanTasks.tasksTable.tasksTableQuery,
            allRowsSelected: true,
          },
        },
      },
    }),
};

describe('TasksDashboard - Selectors', () =>
  testSelectorsSnapshotWithFixtures(fixtures));

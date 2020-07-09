import { testSelectorsSnapshotWithFixtures } from '@theforeman/test';
import {
  selectActionText,
  selectActionState,
  selectActionType,
  selectSelectedTasks,
  selectSelectedRowsLen,
} from '../ConfirmModalSelectors';
import { CANCEL_MODAL } from '../../../TasksTableConstants';

const state = {
  foremanTasks: {
    confirmModal: {
      actionText: 'some-text',
      actionState: 'some-state',
      actionType: 'some-type',
    },
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
      tasksTableQuery: { selectedRows: [1, 2, 3] },
    },
  },
};

const fixtures = {
  'should select actionText': () => selectActionText(state),
  'should select actionState': () => selectActionState(state),
  'should select actionType': () => selectActionType(state),
  'should select selectedTasks': () => selectSelectedTasks(state),
  'should select selectedRowsLen 1': () =>
    selectSelectedRowsLen({
      ...state,
      foremanTasks: { confirmModal: { actionType: CANCEL_MODAL } },
    }),
  'should select selectedRowsLen all': () => selectSelectedRowsLen(state),
  'should select selectedRowsLen some': () =>
    selectSelectedRowsLen({
      ...state,
      tasksTable: { tasksTableQuery: { allRowsSelected: true } },
    }),
};

describe('TasksDashboard - Selectors', () =>
  testSelectorsSnapshotWithFixtures(fixtures));

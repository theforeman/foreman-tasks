import taskActions from '../ConfirmModalActions';
import {
  CANCEL_MODAL,
  RESUME_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
} from '../../../TasksTableConstants';

import { FORCE_UNLOCK_MODAL } from '../../../../TaskActions/TaskActionsConstants';

import { resumeTask, cancelTask } from '../../../TasksTableActions';
import {
  bulkCancelBySearch,
  bulkCancelById,
  bulkResumeBySearch,
  bulkResumeById,
  forceCancelTask,
} from '../../../TasksBulkActions';

jest.mock('../../../TasksBulkActions');
jest.mock('../../../TasksTableActions');

const bulkCancelBySearchMock = 'bulkCancelBySearchMock';
const bulkCancelByIdMock = 'bulkCancelByIdMock';
const bulkResumeBySearchMock = 'bulkResumeBySearchMock';
const bulkResumeByIdMock = 'bulkResumeByIdMock';
const resumeTaskMock = 'resumeTaskMock';
const cancelTaskMock = 'cancelTaskMock';

bulkCancelBySearch.mockImplementation(() => bulkCancelBySearchMock);
bulkCancelById.mockImplementation(() => bulkCancelByIdMock);
bulkResumeBySearch.mockImplementation(() => bulkResumeBySearchMock);
bulkResumeById.mockImplementation(() => bulkResumeByIdMock);
resumeTask.mockImplementation(() => resumeTaskMock);
cancelTask.mockImplementation(() => cancelTaskMock);

const url = 'some-url';
const query = 'some-query';
const parentTaskID = 'some-parentTaskID';

const runWithGetState = (state, action, dispatch, ...params) => {
  const getState = () => state;
  action(...params)(dispatch, getState);
};

const clickedState = {
  foremanTasks: {
    tasksTable: {
      tasksTableQuery: {
        clicked: { taskId: 'some-id', taskName: 'some-name' },
      },
    },
  },
};

const selectedState = {
  foremanTasks: {
    tasksTable: {
      tasksTableQuery: {
        allRowsSelected: false,
        selectedRows: [1, 2, 3],
      },
      tasksTableContent: {
        results: [
          {
            id: 1,
            action: 'action1',
            available_actions: { cancellable: true },
          },
          {
            id: 2,
            action: 'action2',
            available_actions: { resumable: true },
          },
        ],
      },
    },
  },
};
const allRowsState = {
  foremanTasks: {
    tasksTable: {
      tasksTableQuery: {
        allRowsSelected: true,
      },
    },
  },
};
describe('ConfirmModalActions', () => {
  const dispatch = jest.fn();

  beforeEach(() => dispatch.mockClear());
  it('run CANCEL_MODAL', () => {
    runWithGetState(clickedState, taskActions[CANCEL_MODAL], dispatch, {
      url,
      parentTaskID,
    });
    expect(dispatch).toBeCalledWith(cancelTaskMock);
  });
  it('run RESUME_MODAL', () => {
    runWithGetState(clickedState, taskActions[RESUME_MODAL], dispatch, {
      url,
      parentTaskID,
    });
    expect(dispatch).toBeCalledWith(resumeTaskMock);
  });
  it('run FORCE_UNLOCK_MODAL', () => {
    runWithGetState(clickedState, taskActions[FORCE_UNLOCK_MODAL], dispatch, {
      url,
      parentTaskID,
    });
    expect(dispatch).toBeCalledWith(forceCancelTask);
  });
  it('run CANCEL_SELECTED_MODAL by id', () => {
    runWithGetState(
      selectedState,
      taskActions[CANCEL_SELECTED_MODAL],
      dispatch,
      {
        url,
        query,
        parentTaskID,
      }
    );
    expect(dispatch).toBeCalledWith(bulkCancelByIdMock);
  });

  it('run CANCEL_SELECTED_MODAL by search', () => {
    runWithGetState(
      allRowsState,
      taskActions[CANCEL_SELECTED_MODAL],
      dispatch,
      {
        url,
        query,
        parentTaskID,
      }
    );
    expect(dispatch).toBeCalledWith(bulkCancelBySearchMock);
  });
  it('run RESUME_SELECTED_MODAL by id', () => {
    runWithGetState(
      selectedState,
      taskActions[RESUME_SELECTED_MODAL],
      dispatch,
      {
        url,
        query,
        parentTaskID,
      }
    );
    expect(dispatch).toBeCalledWith(bulkResumeByIdMock);
  });
  it('run RESUME_SELECTED_MODAL by search', () => {
    runWithGetState(
      allRowsState,
      taskActions[RESUME_SELECTED_MODAL],
      dispatch,
      {
        url,
        query,
        parentTaskID,
      }
    );
    expect(dispatch).toBeCalledWith(bulkResumeBySearchMock);
  });
});

import { API } from 'foremanReact/redux/API';
import {
  bulkByIdRequest,
  bulkBySearchRequest,
  bulkCancelById,
  bulkCancelBySearch,
  bulkResumeById,
  bulkResumeBySearch,
  bulkForceCancelById,
  bulkForceCancelBySearch,
} from '../TasksBulkActions';
import {
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_FORCE_CANCEL_REQUEST,
  TASKS_FORCE_CANCEL_SUCCESS,
  TASKS_FORCE_CANCEL_FAILURE,
} from '../../TaskActions/TaskActionsConstants';

jest.mock('foremanReact/redux/API');

jest.mock('foremanReact/components/ToastsList', () => ({
  addToast: toast => ({
    type: 'TOASTS_ADD',
    payload: {
      message: toast,
    },
  }),
}));

const task = {
  id: 'some-id',
  name: 'some-name',
  action: 'some-action',
  can_edit: true,
};

const expectToastDispatch = (dispatch, callIndex, { message, type }) => {
  expect(dispatch.mock.calls[callIndex][0]).toEqual({
    type: 'TOASTS_ADD',
    payload: {
      message: { message, type },
    },
  });
};

describe('TasksBulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    API.post.mockResolvedValue({ data: {} });
  });

  describe('bulkByIdRequest', () => {
    it('posts task ids to the bulk action path', async () => {
      await bulkByIdRequest([task], 'bulk_resume');

      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_resume',
        { task_ids: [task.id] }
      );
    });
  });

  describe('bulkBySearchRequest', () => {
    it('posts the search query', async () => {
      await bulkBySearchRequest({
        query: 'state=running',
        parentTaskID: null,
        path: 'bulk_cancel',
      });

      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_cancel',
        { search: 'state=running' }
      );
    });

    it('appends parent_task_id to the search when parentTaskID is set', async () => {
      await bulkBySearchRequest({
        query: '',
        parentTaskID: 'parent',
        path: 'bulk_resume',
      });

      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_resume',
        { search: 'parent_task_id=parent' }
      );
    });

    it('combines query and parent_task_id', async () => {
      await bulkBySearchRequest({
        query: 'state=running',
        parentTaskID: 'parent',
        path: 'bulk_stop',
      });

      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_stop',
        { search: ' state=running and parent_task_id=parent' }
      );
    });
  });

  describe('bulkResumeById', () => {
    it('dispatches success toasts and reloads when tasks are resumed', async () => {
      const selected = [{ ...task, available_actions: { resumable: true } }];
      API.post.mockResolvedValue({
        data: {
          resumed: [{ action: 'I am resumed' }],
          failed: [{ action: 'I am failed' }],
        },
      });
      const reloadPage = jest.fn();
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage })(dispatch);

      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_RESUME_SUCCESS,
      });
      expectToastDispatch(dispatch, 2, {
        message: 'I am resumed Task execution was resumed',
        type: 'success',
      });
      expectToastDispatch(dispatch, 3, {
        message: 'I am failed Task execution could not be resumed',
        type: 'error',
      });
      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_resume',
        { task_ids: [task.id] }
      );
    });

    it('does not reload when nothing was resumed', async () => {
      const selected = [{ ...task, available_actions: { resumable: true } }];
      API.post.mockResolvedValue({
        data: {
          skipped: [{ action: 'I am skipped' }],
        },
      });
      const reloadPage = jest.fn();
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage })(dispatch);

      expect(reloadPage).not.toHaveBeenCalled();
    });

    it('handles skipped tasks in the API response', async () => {
      const selected = [{ ...task, available_actions: { resumable: true } }];
      API.post.mockResolvedValue({
        data: {
          skipped: [{ action: 'I am skipped' }],
        },
      });
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_RESUME_SUCCESS,
      });
      expectToastDispatch(dispatch, 2, {
        message: 'I am skipped Task execution task has to be resumable',
        type: 'warning',
      });
    });

    it('handles API failure', async () => {
      const selected = [{ ...task, available_actions: { resumable: true } }];
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_RESUME_FAILURE,
        error: expect.any(Error),
      });
      expectToastDispatch(dispatch, 2, {
        message: 'Cannot resume tasks at the moment Error: Network Error',
        type: 'error',
      });
    });

    it('warns when selected tasks are not resumable', async () => {
      const selected = [
        { ...task, available_actions: { resumable: false, cancellable: false } },
      ];
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: 'Not all the selected tasks can be resumed',
        type: 'warning',
      });
    });

    it('warns when the user cannot edit resumable tasks', async () => {
      const selected = [
        {
          ...task,
          available_actions: { resumable: true },
          can_edit: false,
        },
      ];
      const dispatch = jest.fn();

      await bulkResumeById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: 'Not all the selected tasks can be resumed',
        type: 'warning',
      });
    });
  });

  describe('bulkCancelById', () => {
    it('dispatches success toasts and reloads when tasks are cancelled', async () => {
      const selected = [{ ...task, available_actions: { cancellable: true } }];
      API.post.mockResolvedValue({
        data: {
          cancelled: [{ action: 'I am cancelled' }],
        },
      });
      const reloadPage = jest.fn();
      const dispatch = jest.fn();

      await bulkCancelById({ selected, reloadPage })(dispatch);

      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_CANCEL_SUCCESS,
      });
      expectToastDispatch(dispatch, 2, {
        message: 'I am cancelled Task execution was cancelled',
        type: 'success',
      });
    });

    it('handles skipped tasks in the API response', async () => {
      const selected = [{ ...task, available_actions: { cancellable: true } }];
      API.post.mockResolvedValue({
        data: {
          skipped: [{ action: 'I am skipped' }],
        },
      });
      const dispatch = jest.fn();

      await bulkCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expectToastDispatch(dispatch, 2, {
        message: 'I am skipped Task execution task has to be cancellable',
        type: 'warning',
      });
    });

    it('warns when selected tasks are not cancellable', async () => {
      const selected = [{ ...task, available_actions: { cancellable: false } }];
      const dispatch = jest.fn();

      await bulkCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: 'Not all the selected tasks can be cancelled',
        type: 'warning',
      });
    });

    it('warns when the user cannot edit cancellable tasks', async () => {
      const selected = [
        {
          ...task,
          available_actions: { cancellable: true },
          can_edit: false,
        },
      ];
      const dispatch = jest.fn();

      await bulkCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: 'Not all the selected tasks can be cancelled',
        type: 'warning',
      });
    });
  });

  describe('bulkForceCancelById', () => {
    it('dispatches success and warning toasts and reloads on success', async () => {
      const selected = [
        {
          ...task,
          state: 'running',
          can_edit: true,
        },
      ];
      API.post.mockResolvedValue({
        data: {
          stopped_length: 2,
          skipped_length: 4,
        },
      });
      const reloadPage = jest.fn();
      const dispatch = jest.fn();

      await bulkForceCancelById({ selected, reloadPage })(dispatch);

      expect(reloadPage).toHaveBeenCalled();
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_FORCE_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_FORCE_CANCEL_SUCCESS,
      });
      expectToastDispatch(dispatch, 2, {
        message: '2 task(s) cancelled with force',
        type: 'success',
      });
      expectToastDispatch(dispatch, 3, {
        message: '4 task(s) are already stopped',
        type: 'warning',
      });
    });

    it('handles API failure', async () => {
      const selected = [
        {
          ...task,
          state: 'running',
          can_edit: true,
        },
      ];
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await bulkForceCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_FORCE_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_FORCE_CANCEL_FAILURE,
        error: expect.any(Error),
      });
      expectToastDispatch(dispatch, 2, {
        message: 'Cannot force cancel tasks at the moment Error: Network Error',
        type: 'error',
      });
    });

    it('warns when all selected tasks are already stopped', async () => {
      const selected = [
        {
          ...task,
          available_actions: { resumable: false },
          state: 'stopped',
        },
      ];
      const dispatch = jest.fn();

      await bulkForceCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: '1 task(s) are already stopped',
        type: 'warning',
      });
    });

    it('warns when the user lacks permission to force cancel', async () => {
      const selected = [
        {
          ...task,
          state: 'running',
          available_actions: { resumable: false },
          can_edit: false,
        },
      ];
      const dispatch = jest.fn();

      await bulkForceCancelById({ selected, reloadPage: jest.fn() })(dispatch);

      expect(API.post).not.toHaveBeenCalled();
      expectToastDispatch(dispatch, 0, {
        message: 'User has no permission for 1 task(s)',
        type: 'warning',
      });
    });
  });

  describe('bulk search actions', () => {
    it('bulkCancelBySearch dispatches request and info toast', async () => {
      const dispatch = jest.fn();

      await bulkCancelBySearch({
        query: '',
        parentTaskID: 'parent',
      })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_CANCEL_REQUEST,
      });
      expectToastDispatch(dispatch, 1, {
        message: 'Canceling selected tasks, this might take a while',
        type: 'info',
      });
      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_cancel',
        { search: 'parent_task_id=parent' }
      );
    });

    it('bulkResumeBySearch dispatches request and info toast', async () => {
      const dispatch = jest.fn();

      await bulkResumeBySearch({
        query: '',
        parentTaskID: 'parent',
      })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expectToastDispatch(dispatch, 1, {
        message: 'Resuming selected tasks, this might take a while',
        type: 'info',
      });
      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_resume',
        { search: 'parent_task_id=parent' }
      );
    });

    it('bulkForceCancelBySearch dispatches request and info toast', async () => {
      const dispatch = jest.fn();

      await bulkForceCancelBySearch({
        query: '',
        parentTaskID: 'parent',
      })(dispatch);

      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_FORCE_CANCEL_REQUEST,
      });
      expectToastDispatch(dispatch, 1, {
        message: 'Canceling with force selected tasks, this might take a while',
        type: 'info',
      });
      expect(API.post).toHaveBeenCalledWith(
        '/foreman_tasks/api/tasks/bulk_stop',
        { search: 'parent_task_id=parent' }
      );
    });
  });
});

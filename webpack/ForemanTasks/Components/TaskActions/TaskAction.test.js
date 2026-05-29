import { API } from 'foremanReact/redux/API';
import {
  cancelTaskRequest,
  resumeTaskRequest,
  forceCancelTaskRequest,
  unlockTaskRequest,
} from './';
import {
  TASKS_CANCEL_REQUEST,
  TASKS_CANCEL_SUCCESS,
  TASKS_CANCEL_FAILURE,
  TASKS_RESUME_REQUEST,
  TASKS_RESUME_SUCCESS,
  TASKS_RESUME_FAILURE,
  TASKS_FORCE_CANCEL_REQUEST,
  TASKS_FORCE_CANCEL_SUCCESS,
  TASKS_FORCE_CANCEL_FAILURE,
  TASKS_UNLOCK_REQUEST,
  TASKS_UNLOCK_SUCCESS,
  TASKS_UNLOCK_FAILURE,
} from './TaskActionsConstants';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

jest.mock('foremanReact/redux/API');
jest.mock('foremanReact/components/ToastsList', () => ({
  addToast: toast => ({
    type: 'TOASTS_ADD',
    payload: {
      message: toast,
    },
  }),
}));

const taskId = 'some-id';
const taskName = 'some-name';

const toastAction = (message, type) => ({
  type: 'TOASTS_ADD',
  payload: {
    message: {
      message,
      type,
    },
  },
});

describe('Task actions', () => {
  beforeEach(() => {
    API.post.mockReset();
    API.post.mockResolvedValue({ data: 'some-data' });
  });

  describe('cancelTaskRequest', () => {
    it('dispatches success actions and toasts when cancel succeeds', async () => {
      const dispatch = jest.fn();

      await cancelTaskRequest(taskId, taskName)(dispatch);

      expect(API.post).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${taskId}/cancel`
      );
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch.mock.calls[0][0]).toEqual(
        toastAction('Trying to cancel some-name task', 'info')
      );
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[2][0]).toEqual({
        type: TASKS_CANCEL_SUCCESS,
      });
      expect(dispatch.mock.calls[3][0]).toEqual(
        toastAction('some-name Task execution was cancelled', 'success')
      );
    });

    it('dispatches failure actions and warning toast when cancel fails', async () => {
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await cancelTaskRequest(taskId, taskName)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch.mock.calls[0][0]).toEqual(
        toastAction('Trying to cancel some-name task', 'info')
      );
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[2][0]).toEqual({
        type: TASKS_CANCEL_FAILURE,
        payload: expect.any(Error),
      });
      expect(dispatch.mock.calls[3][0]).toEqual(
        toastAction(
          'some-name Task execution task has to be cancellable',
          'warning'
        )
      );
    });
  });

  describe('resumeTaskRequest', () => {
    it('dispatches success actions and toast when resume succeeds', async () => {
      const dispatch = jest.fn();

      await resumeTaskRequest(taskId, taskName)(dispatch);

      expect(API.post).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${taskId}/resume`
      );
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_RESUME_SUCCESS,
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction('some-name Task execution was resumed', 'success')
      );
    });

    it('dispatches failure actions and error toast when resume fails', async () => {
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await resumeTaskRequest(taskId, taskName)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_RESUME_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_RESUME_FAILURE,
        payload: expect.any(Error),
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction('some-name Task execution could not be resumed', 'error')
      );
    });
  });

  describe('forceCancelTaskRequest', () => {
    it('dispatches success actions and toast when force cancel succeeds', async () => {
      const dispatch = jest.fn();

      await forceCancelTaskRequest(taskId, taskName)(dispatch);

      expect(API.post).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${taskId}/force_unlock`
      );
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_FORCE_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_FORCE_CANCEL_SUCCESS,
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction(
          'some-name Task execution resources were unlocked with force.',
          'success'
        )
      );
    });

    it('dispatches failure actions and warning toast when force cancel fails', async () => {
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await forceCancelTaskRequest(taskId, taskName)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_FORCE_CANCEL_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_FORCE_CANCEL_FAILURE,
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction(
          'some-name Task execution cannot be cancelled with force at the moment.',
          'warning'
        )
      );
    });
  });

  describe('unlockTaskRequest', () => {
    it('dispatches success actions and toast when unlock succeeds', async () => {
      const dispatch = jest.fn();

      await unlockTaskRequest(taskId, taskName)(dispatch);

      expect(API.post).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${taskId}/unlock`
      );
      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_UNLOCK_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_UNLOCK_SUCCESS,
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction(
          'some-name Task execution resources were unlocked ',
          'success'
        )
      );
    });

    it('dispatches failure actions and warning toast when unlock fails', async () => {
      API.post.mockRejectedValue(new Error('Network Error'));
      const dispatch = jest.fn();

      await unlockTaskRequest(taskId, taskName)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: TASKS_UNLOCK_REQUEST,
      });
      expect(dispatch.mock.calls[1][0]).toEqual({
        type: TASKS_UNLOCK_FAILURE,
      });
      expect(dispatch.mock.calls[2][0]).toEqual(
        toastAction(
          'some-name Task execution resources cannot be unlocked at the moment.',
          'warning'
        )
      );
    });
  });
});

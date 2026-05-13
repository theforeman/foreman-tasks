import {
  taskReloadStop,
  taskReloadStart,
  cancelStep,
} from '../TaskDetailsActions';
import {
  FOREMAN_TASK_DETAILS,
  TASK_STEP_CANCEL,
} from '../TaskDetailsConstants';

jest.mock('foremanReact/components/ToastsList', () => ({
  addToast: toast => ({
    type: 'TOASTS_ADD',
    payload: {
      message: toast,
    },
  }),
}));

describe('TaskDetails - Actions', () => {
  it('should stop reload', () => {
    expect(taskReloadStop()).toEqual({
      type: 'STOP_INTERVAL',
      key: FOREMAN_TASK_DETAILS,
    });
  });

  it('should start reload', () => {
    const dispatch = jest.fn();
    taskReloadStart(1)(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(1);
    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe('API_GET');
    expect(action.interval).toBe(5000);
    expect(action.payload.key).toBe(FOREMAN_TASK_DETAILS);
    expect(action.payload.url).toBe(
      '/foreman_tasks/api/tasks/1/details?include_permissions'
    );
    expect(action.payload.handleSuccess).toEqual(expect.any(Function));
    expect(action.payload.handleError).toEqual(expect.any(Function));
  });

  it('should cancelStep', async () => {
    const dispatch = jest.fn();
    await cancelStep('task-id', 'step-id')(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(2);

    expect(dispatch.mock.calls[0][0]).toEqual({
      type: 'TOASTS_ADD',
      payload: {
        message: {
          message: 'Trying to cancel step step-id',
          type: 'info',
        },
      },
    });

    const postAction = dispatch.mock.calls[1][0];
    expect(postAction.type).toBe('API_POST');
    expect(postAction.payload.key).toBe(TASK_STEP_CANCEL);
    expect(postAction.payload.url).toBe(
      '/foreman_tasks/tasks/task-id/cancel_step?step_id=step-id'
    );
    expect(postAction.payload.handleSuccess).toEqual(expect.any(Function));
    expect(postAction.payload.handleError).toEqual(expect.any(Function));
  });
});

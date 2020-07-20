import { post, get } from 'foremanReact/redux/API';
import { addToast } from 'foremanReact/redux/actions/toasts';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  withInterval,
  stopInterval,
} from 'foremanReact/redux/middlewares/IntervalMiddleware';
import { TASK_STEP_CANCEL, FOREMAN_TASK_DETAILS } from './TaskDetailsConstants';
import {
  errorToastData,
  infoToastData,
  successToastData,
} from '../common/ToastsHelpers';

export const taskReloadStop = () => stopInterval(FOREMAN_TASK_DETAILS);

export const taskReloadStart = id => dispatch => {
  dispatch(
    withInterval(
      get({
        key: FOREMAN_TASK_DETAILS,
        url: `/foreman_tasks/api/tasks/${id}/details?include_permissions`,
        handleSuccess: ({ data }) => {
          if (data.state === 'stopped') {
            dispatch(taskReloadStop(id));
          }
        },
        handleError: () => {
          dispatch(taskReloadStop());
        },
      }),
      5000
    )
  );
};

export const fetchTaskDetails = id => dispatch => {
  dispatch(
    get({
      key: FOREMAN_TASK_DETAILS,
      url: `/foreman_tasks/api/tasks/${id}/details?include_permissions`,
      handleSuccess: ({ data }) => {
        if (data.state !== 'stopped') {
          dispatch(taskReloadStart(id));
        }
      },
    })
  );
};

export const cancelStep = (taskId, stepId) => async dispatch => {
  dispatch(addToast(infoToastData(`${__('Trying to cancel step')} ${stepId}`)));
  dispatch(
    post({
      key: TASK_STEP_CANCEL,
      url: `/foreman_tasks/tasks/${taskId}/cancel_step?step_id=${stepId}`,
      handleSuccess: () => {
        dispatch(addToast(successToastData(`${stepId} {__('Step Canceled')}`)));
      },
      handleError: error => {
        dispatch(
          addToast(
            errorToastData(
              `${__('Could not cancel step.')} ${__(
                'Error:'
              )} ${stepId} ${error.response &&
                error.response.data &&
                error.response.data.error}`
            )
          )
        );
      },
    })
  );
};

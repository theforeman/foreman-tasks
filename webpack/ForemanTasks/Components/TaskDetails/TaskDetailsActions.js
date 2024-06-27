import { post, get } from 'foremanReact/redux/API';
import { addToast } from 'foremanReact/components/ToastsList';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  withInterval,
  stopInterval,
} from 'foremanReact/redux/middlewares/IntervalMiddleware';
import { foremanTasksApiPath, foremanTasksPath } from '../common/urlHelpers';
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
        url: foremanTasksApiPath(`${id}/details?include_permissions`),
        handleSuccess: ({ data }) => {
          if (data.state === 'stopped') {
            dispatch(stopInterval(FOREMAN_TASK_DETAILS));
          }
        },
        handleError: () => {
          dispatch(stopInterval(FOREMAN_TASK_DETAILS));
        },
      }),
      5000
    )
  );
};

export const cancelStep = (taskId, stepId) => async dispatch => {
  dispatch(addToast(infoToastData(`${__('Trying to cancel step')} ${stepId}`)));
  dispatch(
    post({
      key: TASK_STEP_CANCEL,
      url: foremanTasksPath(`${taskId}/cancel_step?step_id=${stepId}`),
      handleSuccess: () => {
        dispatch(
          addToast(successToastData(`${stepId} ${__('Step Canceled')}`))
        );
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

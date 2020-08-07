/* eslint-disable camelcase */
import {
  selectAPIResponse,
  selectAPIByKey,
} from 'foremanReact/redux/API/APISelectors';
import { selectDoesIntervalExist } from 'foremanReact/redux/middlewares/IntervalMiddleware/IntervalSelectors';
import { STATUS } from 'foremanReact/constants';
import { selectForemanTasks } from '../../ForemanTasksSelectors';
import { FOREMAN_TASK_DETAILS } from './TaskDetailsConstants';

export const selectTaskDetails = state =>
  selectForemanTasks(state).taskDetails || {};

export const selectTaskDetailsResponse = state =>
  selectAPIResponse(state, FOREMAN_TASK_DETAILS);

export const selectStartAt = state =>
  selectTaskDetailsResponse(state)?.start_at;

export const selectStartBefore = state =>
  selectTaskDetailsResponse(state)?.start_before;

export const selectStartedAt = state =>
  selectTaskDetailsResponse(state)?.started_at;

export const selectEndedAt = state =>
  selectTaskDetailsResponse(state)?.ended_at;

export const selectInput = state =>
  selectTaskDetailsResponse(state).input || [];

export const selectOutput = state =>
  selectTaskDetailsResponse(state).output || {};

export const selectResumable = state =>
  selectTaskDetailsResponse(state).resumable || false;

export const selectCancellable = state =>
  selectTaskDetailsResponse(state).cancellable || false;

export const selectErrors = state => {
  const { humanized } = selectTaskDetailsResponse(state);
  return humanized ? humanized.errors : [];
};

export const selectProgress = state =>
  selectTaskDetailsResponse(state).progress
    ? Math.trunc(selectTaskDetailsResponse(state).progress * 100)
    : 0;

export const selectUsername = state =>
  selectTaskDetailsResponse(state)?.username;

export const selectLabel = state => selectTaskDetailsResponse(state)?.label;

export const selectExecutionPlan = state =>
  selectTaskDetailsResponse(state).execution_plan || {};

export const selectFailedSteps = state =>
  selectTaskDetailsResponse(state).failed_steps || [];

export const selectRunningSteps = state =>
  selectTaskDetailsResponse(state).running_steps || [];

export const selectHelp = state => selectTaskDetailsResponse(state)?.help;

export const selectHasSubTasks = state =>
  selectTaskDetailsResponse(state).has_sub_tasks || false;

export const selectLocks = state =>
  selectTaskDetailsResponse(state).locks || [];

export const selectUsernamePath = state =>
  selectTaskDetailsResponse(state)?.username_path;

export const selectAction = state =>
  selectTaskDetailsResponse(state).action || '';

export const selectState = state => selectTaskDetailsResponse(state)?.state;

export const selectResult = state => selectTaskDetailsResponse(state)?.result;

export const selectTimeoutId = state =>
  selectTaskDetailsResponse(state)?.timeoutId;

export const selectTaskReload = state =>
  !!selectDoesIntervalExist(state, FOREMAN_TASK_DETAILS);

export const selectParentTask = state =>
  selectTaskDetailsResponse(state).parent_task_id || '';

export const selectExternalId = state =>
  selectTaskDetailsResponse(state)?.external_id;

export const selectDynflowEnableConsole = state =>
  selectTaskDetailsResponse(state).dynflow_enable_console || false;

export const selectCanEdit = state =>
  selectTaskDetailsResponse(state).can_edit || false;

export const selectStatus = state => selectTaskDetailsResponse(state).status;

export const selectAPIError = state =>
  selectTaskDetailsResponse(state)?.APIerror;

export const selectIsLoading = state =>
  !!selectAPIByKey(state, FOREMAN_TASK_DETAILS).response &&
  selectStatus(state) === STATUS.PENDING;

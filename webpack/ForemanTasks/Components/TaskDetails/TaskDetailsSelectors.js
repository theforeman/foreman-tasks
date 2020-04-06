import { selectForemanTasks } from '../../ForemanTasksSelectors';

export const selectTaskDetails = state =>
  selectForemanTasks(state).taskDetails || {};

export const selectStartAt = state => selectTaskDetails(state).start_at || null;

export const selectStartBefore = state =>
  selectTaskDetails(state).start_before || null;

export const selectStartedAt = state =>
  selectTaskDetails(state).started_at || null;

export const selectEndedAt = state => selectTaskDetails(state).ended_at || null;

export const selectInput = state => selectTaskDetails(state).input || [];

export const selectOutput = state => selectTaskDetails(state).output || {};

export const selectResumable = state =>
  selectTaskDetails(state).resumable || false;

export const selectCancellable = state =>
  selectTaskDetails(state).cancellable || false;

export const selectErrors = state => {
  const { humanized } = selectTaskDetails(state);
  return humanized ? humanized.errors : [];
};

export const selectProgress = state =>
  selectTaskDetails(state).progress
    ? parseFloat((selectTaskDetails(state).progress * 100).toFixed(2))
    : 0;

export const selectUsername = state =>
  selectTaskDetails(state).username || null;

export const selectLabel = state => selectTaskDetails(state).label || null;

export const selectExecutionPlan = state =>
  selectTaskDetails(state).execution_plan || {};

export const selectFailedSteps = state =>
  selectTaskDetails(state).failed_steps || [];

export const selectRunningSteps = state =>
  selectTaskDetails(state).running_steps || [];

export const selectHelp = state => selectTaskDetails(state).help || null;

export const selectHasSubTasks = state =>
  selectTaskDetails(state).has_sub_tasks || false;

export const selectLocks = state => selectTaskDetails(state).locks || [];

export const selectUsernamePath = state =>
  selectTaskDetails(state).username_path || null;

export const selectAction = state => selectTaskDetails(state).action || '';

export const selectState = state => selectTaskDetails(state).state || null;

export const selectResult = state => selectTaskDetails(state).result || null;

export const selectTimeoutId = state =>
  selectTaskDetails(state).timeoutId || null;

export const selectTaskReload = state =>
  selectTaskDetails(state).taskReload || false;

export const selectParentTask = state =>
  selectTaskDetails(state).parent_task_id || '';

export const selectExternalId = state =>
  selectTaskDetails(state).external_id || null;

export const selectDynflowEnableConsole = state =>
  selectTaskDetails(state).dynflow_enable_console || false;

export const selectCanEdit = state =>
  selectTaskDetails(state).can_edit || false;

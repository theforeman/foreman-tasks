import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TaskDetails from './TaskDetails';
import * as actions from './TaskDetailsActions';
import reducer from './TaskDetailsReducer';
import {
  selectEndedAt,
  selectStartAt,
  selectStartBefore,
  selectStartedAt,
  selectLocks,
  selectInput,
  selectOutput,
  selectResumable,
  selectCancellable,
  selectHelp,
  selectErrors,
  selectProgress,
  selectUsername,
  selectLabel,
  selectExecutionPlan,
  selectFailedSteps,
  selectRunningSteps,
  selectHasSubTasks,
  selectAllowDangerousActions,
  selectUsernamePath,
  selectAction,
  selectState,
  selectResult,
  selectTimeoutId,
  selectTaskReload,
  selectParentTask,
  selectShowUnlockModal,
  selectShowForceUnlockModal,
  selectExternalId,
} from './TaskDetailsSelectors';

const mapStateToProps = state => ({
  startAt: selectStartAt(state),
  startBefore: selectStartBefore(state),
  startedAt: selectStartedAt(state),
  endedAt: selectEndedAt(state),
  input: selectInput(state),
  output: selectOutput(state),
  resumable: selectResumable(state),
  cancellable: selectCancellable(state),
  errors: selectErrors(state),
  progress: selectProgress(state),
  username: selectUsername(state),
  label: selectLabel(state),
  executionPlan: selectExecutionPlan(state),
  failedSteps: selectFailedSteps(state),
  runningSteps: selectRunningSteps(state),
  help: selectHelp(state),
  hasSubTasks: selectHasSubTasks(state),
  allowDangerousActions: selectAllowDangerousActions(state),
  locks: selectLocks(state),
  usernamePath: selectUsernamePath(state),
  action: selectAction(state),
  state: selectState(state),
  result: selectResult(state),
  timeoutId: selectTimeoutId(state),
  taskReload: selectTaskReload(state),
  parentTask: selectParentTask(state),
  showUnlockModal: selectShowUnlockModal(state),
  showForceUnlockModal: selectShowForceUnlockModal(state),
  externalId: selectExternalId(state),
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export const reducers = { taskDetails: reducer };

export default connect(mapStateToProps, mapDispatchToProps)(TaskDetails);

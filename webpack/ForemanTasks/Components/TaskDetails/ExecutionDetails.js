import React from 'react';
import PropTypes from 'prop-types';
import RunningSteps from './Components/RunningSteps';
import Errors from './Components/Errors';

const ExecutionDetails = ({
  state,
  runningSteps,
  cancelStep,
  id,
  taskReload,
  taskReloadStart,
  executionPlan,
  failedSteps,
  result,
}) => {
  const hasFailedSteps = failedSteps.length > 0;
  const hasRunningSteps = runningSteps.length > 0;
  const isActiveExecutionState =
    state === 'running' || state === 'pending' || state === 'paused';

  // Prefer Errors when failed steps exist (e.g. paused-after-error). Only fall
  // back to the RunningSteps empty state for active tasks with no failures.
  const showRunningSteps =
    hasRunningSteps || (isActiveExecutionState && !hasFailedSteps);
  const showErrors = hasFailedSteps || !showRunningSteps;

  return (
    <div
      id="execution-details-panel"
      data-ouia-component-id="execution-details-panel"
    >
      {showRunningSteps && (
        <RunningSteps
          executionPlan={executionPlan}
          result={result}
          runningSteps={runningSteps}
          id={id}
          cancelStep={cancelStep}
          taskReload={taskReload}
          taskReloadStart={taskReloadStart}
        />
      )}
      {showErrors && (
        <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
      )}
    </div>
  );
};

ExecutionDetails.propTypes = {
  state: PropTypes.string,
  result: PropTypes.string,
  runningSteps: PropTypes.array,
  cancelStep: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  taskReload: PropTypes.bool.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
  executionPlan: PropTypes.shape({}),
  failedSteps: PropTypes.array,
};

ExecutionDetails.defaultProps = {
  state: '',
  result: undefined,
  runningSteps: [],
  executionPlan: {},
  failedSteps: [],
};

export default ExecutionDetails;

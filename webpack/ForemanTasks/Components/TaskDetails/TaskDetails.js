import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import Task from './Components/Task';
import RunningSteps from './Components/RunningSteps';
import Errors from './Components/Errors';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import { getTaskID } from './TasksDetailsHelper';
import { TaskSkeleton } from './Components/TaskSkeleton';

import './TaskDetails.scss';

const TaskDetails = ({
  externalId,
  startedAt,
  endedAt,
  label,
  input,
  output,
  executionPlan,
  failedSteps,
  runningSteps,
  locks,
  cancelStep,
  taskReloadStart,
  taskReloadStop,
  fetchTaskDetails,
  APIerror,
  ...props
}) => {
  const id = getTaskID();
  const { taskReload, status, isData } = props;

  useEffect(() => {
    fetchTaskDetails(id);
    return () => {
      taskReloadStop();
    };
  }, [id, fetchTaskDetails, taskReloadStop]);

  const taskProgressToggle = () => {
    if (taskReload) {
      taskReloadStop();
    } else {
      taskReloadStart(id);
    }
  };

  if (status === STATUS.ERROR) {
    return (
      <MessageBox
        key="task-details-error"
        icontype="error-circle-o"
        msg={__(`Could not receive data: ${APIerror && APIerror.message}`)}
      />
    );
  }
  const resumable = executionPlan ? executionPlan.state === 'paused' : false;
  const cancellable = executionPlan ? executionPlan.cancellable : false;
  const loading = status === STATUS.PENDING && !isData;
  return (
    <div className="task-details-react well">
      <Tabs defaultActiveKey={1} animation={false} id="task-details-tabs">
        <Tab eventKey={1} title={__('Task')}>
          {loading ? (
            <TaskSkeleton />
          ) : (
            <Task
              {...{
                ...props,
                cancellable,
                resumable,
                id,
                status,
                taskProgressToggle,
              }}
            />
          )}
        </Tab>
        <Tab eventKey={2} disabled={loading} title={__('Running Steps')}>
          <RunningSteps
            runningSteps={runningSteps}
            id={id}
            cancelStep={cancelStep}
            taskReload={taskReload}
            taskProgressToggle={taskProgressToggle}
          />
        </Tab>
        <Tab eventKey={3} disabled={loading} title={__('Errors')}>
          <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
        </Tab>
        <Tab eventKey={4} disabled={loading} title={__('Locks')}>
          <Locks locks={locks} />
        </Tab>
        <Tab eventKey={5} disabled={loading} title={__('Raw')}>
          <Raw
            {...{ id, label, startedAt, endedAt, input, output, externalId }}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

TaskDetails.propTypes = {
  label: PropTypes.string,
  fetchTaskDetails: PropTypes.func.isRequired,
  runningSteps: PropTypes.array,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  APIerror: PropTypes.object,
  taskReloadStop: PropTypes.func.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
  ...Task.propTypes,
  ...Errors.propTypes,
  ...Locks.propTypes,
  ...Raw.propTypes,
};
TaskDetails.defaultProps = {
  label: '',
  runningSteps: [],
  APIerror: null,
  status: STATUS.PENDING,
  ...Task.defaultProps,
  ...RunningSteps.defaultProps,
  ...Errors.defaultProps,
  ...Locks.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

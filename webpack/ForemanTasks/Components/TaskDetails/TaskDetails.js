import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'patternfly-react';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
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
  executionPlan,
  failedSteps,
  runningSteps,
  locks,
  links,
  cancelStep,
  taskReloadStart,
  taskReloadStop,
  APIerror,
  ...props
}) => {
  const id = getTaskID();
  const { taskReload, status, isLoading } = props;

  useEffect(() => {
    taskReloadStart(id);
    return () => {
      taskReloadStop();
    };
  }, [id, taskReloadStart, taskReloadStop]);

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
        msg={sprintf(__('Could not receive data: %s'), APIerror?.message)}
      />
    );
  }
  const resumable = executionPlan ? executionPlan.state === 'paused' : false;
  const cancellable = executionPlan ? executionPlan.cancellable : false;
  return (
    <div className="task-details-react well">
      <Tabs defaultActiveKey={1} animation={false} id="task-details-tabs">
        <Tab eventKey={1} title={__('Task')}>
          {isLoading ? (
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
                taskReloadStart,
              }}
            />
          )}
        </Tab>
        <Tab eventKey={2} disabled={isLoading} title={__('Running Steps')}>
          <RunningSteps
            runningSteps={runningSteps}
            id={id}
            cancelStep={cancelStep}
            taskReload={taskReload}
            taskReloadStart={taskReloadStart}
          />
        </Tab>
        <Tab eventKey={3} disabled={isLoading} title={__('Errors')}>
          <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
        </Tab>
        <Tab eventKey={4} disabled={isLoading} title={__('Locks')}>
          <Locks locks={locks.concat(links)} />
        </Tab>
        <Tab eventKey={5} disabled={isLoading} title={__('Raw')}>
          <Raw
            id={id}
            label={props.label}
            startedAt={props.startedAt}
            endedAt={props.endedAt}
            input={props.input}
            output={props.output}
            externalId={props.externalId}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

TaskDetails.propTypes = {
  label: PropTypes.string,
  runningSteps: PropTypes.array,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  APIerror: PropTypes.object,
  taskReloadStop: PropTypes.func.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
  links: PropTypes.array,
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
  links: [],
  ...Task.defaultProps,
  ...RunningSteps.defaultProps,
  ...Errors.defaultProps,
  ...Locks.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

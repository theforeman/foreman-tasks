import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import EmptyState from 'foremanReact/components/common/EmptyState';
import PermissionDenied from 'foremanReact/components/PermissionDenied';
import Task from './Components/Task';
import RunningSteps from './Components/RunningSteps';
import Errors from './Components/Errors';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import Dependencies from './Components/Dependencies';
import { getTaskID } from './TasksDetailsHelper';
import { TaskSkeleton } from './Components/TaskSkeleton';

import './TaskDetails.scss';

const TaskDetails = ({
  executionPlan,
  failedSteps,
  runningSteps,
  locks,
  links,
  dependsOn,
  blocks,
  cancelStep,
  taskReloadStart,
  taskReloadStop,
  apiStatus,
  apiErrorMessage,
  apiErrorCode,
  ...props
}) => {
  const id = getTaskID();
  const { taskReload, status, isLoading, result } = props;
  const [activeTabKey, setActiveTabKey] = useState(1);

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

  if (status === STATUS.ERROR || apiStatus === STATUS.ERROR) {
    if (apiErrorCode === 403) {
      return <PermissionDenied missingPermissions={['view_foreman_tasks']} />;
    }

    if (apiErrorCode === 404) {
      return (
        <EmptyState
          icon={<ExclamationCircleIcon />}
          header={__('Task not found')}
          description={
            apiErrorMessage || __('The requested task could not be found.')
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<ExclamationCircleIcon />}
        header={__('Error')}
        description={apiErrorMessage || __('Could not receive task data.')}
      />
    );
  }

  const resumable = executionPlan ? executionPlan.state === 'paused' : false;
  const cancellable = executionPlan ? executionPlan.cancellable : false;
  const lockRecords = locks.concat(links);

  const taskComponentProps = {
    ...props,
    cancellable,
    resumable,
    id,
    status,
    taskProgressToggle,
    taskReloadStart,
  };

  return (
    <div className="task-details-react">
      <Tabs
        id="task-details-tabs"
        ouiaId="task-details-tabs"
        activeKey={activeTabKey}
        onSelect={(_event, tabKey) => setActiveTabKey(tabKey)}
        mountOnEnter
      >
        <Tab
          eventKey={1}
          title={<TabTitleText>{__('Task')}</TabTitleText>}
          aria-label={__('Task')}
          ouiaId="task-details-tab-task"
        >
          {isLoading ? <TaskSkeleton /> : <Task {...taskComponentProps} />}
        </Tab>
        <Tab
          eventKey={2}
          title={<TabTitleText>{__('Running Steps')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Running Steps')}
          ouiaId="task-details-tab-running-steps"
        >
          <RunningSteps
            executionPlan={executionPlan}
            result={result}
            runningSteps={runningSteps}
            id={id}
            cancelStep={cancelStep}
            taskReload={taskReload}
            taskReloadStart={taskReloadStart}
          />
        </Tab>
        <Tab
          eventKey={3}
          title={<TabTitleText>{__('Errors')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Errors')}
          ouiaId="task-details-tab-errors"
        >
          <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
        </Tab>
        <Tab
          eventKey={4}
          title={<TabTitleText>{__('Locks')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Locks')}
          ouiaId="task-details-tab-locks"
        >
          <Locks locks={lockRecords} />
        </Tab>
        <Tab
          eventKey={5}
          title={<TabTitleText>{__('Dependencies')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Dependencies')}
          ouiaId="task-details-tab-dependencies"
        >
          <Dependencies dependsOn={dependsOn} blocks={blocks} />
        </Tab>
        <Tab
          eventKey={6}
          title={<TabTitleText>{__('Raw')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Raw')}
          ouiaId="task-details-tab-raw"
        >
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
  apiStatus: PropTypes.oneOf(Object.keys(STATUS)),
  apiErrorMessage: PropTypes.string,
  apiErrorCode: PropTypes.number,
  taskReloadStop: PropTypes.func.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
  links: PropTypes.array,
  dependsOn: PropTypes.array,
  blocks: PropTypes.array,
  ...Task.propTypes,
  ...Errors.propTypes,
  ...Locks.propTypes,
  ...Dependencies.propTypes,
  ...Raw.propTypes,
};
TaskDetails.defaultProps = {
  label: '',
  runningSteps: [],
  apiErrorMessage: '',
  status: STATUS.PENDING,
  links: [],
  dependsOn: [],
  blocks: [],
  ...Task.defaultProps,
  ...RunningSteps.defaultProps,
  ...Errors.defaultProps,
  ...Locks.defaultProps,
  ...Dependencies.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

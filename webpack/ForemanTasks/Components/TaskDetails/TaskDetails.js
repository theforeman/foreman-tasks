import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { ResourceLoadFailedEmptyState } from 'foremanReact/components/common/EmptyState';
import Task from './Components/Task';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import ExecutionDetails from './ExecutionDetails';
import Dependencies from './Components/Dependencies';
import { TASKS_PATH, VIEW_FOREMAN_TASKS } from './TaskDetailsConstants';
import { getTaskID } from './TasksDetailsHelper';
import { TaskSkeleton } from './Components/TaskSkeleton';

import './TaskDetails.scss';

export const TASK_DETAILS_TAB_KEYS = Object.freeze({
  EXECUTION: 'execution',
  DEPENDENCIES: 'dependencies',
  LOCKS: 'locks',
  RAW: 'raw',
});

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
  const { taskReload, isLoading } = props;
  const [activeTab, setActiveTab] = useState(TASK_DETAILS_TAB_KEYS.EXECUTION);
  const hasViewPermission = usePermissions([VIEW_FOREMAN_TASKS]);

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

  if (apiStatus === STATUS.ERROR || !hasViewPermission) {
    return (
      <ResourceLoadFailedEmptyState
        resourceLabel={__('task')}
        resourceId={id}
        httpStatus={apiErrorCode}
        errorMessage={apiErrorMessage}
        viewPermissions={['view_foreman_tasks']}
        requiredPermissions={['view_foreman_tasks']}
        ouiaIdPrefix="task-details-empty-state"
        primaryAction={{
          label: __('Back to tasks'),
          url: TASKS_PATH,
          ouiaId: 'task-details-empty-state-tasks-list',
        }}
      />
    );
  }

  const resumable = executionPlan ? executionPlan.state === 'paused' : false;
  const cancellable = executionPlan ? executionPlan.cancellable : false;
  const lockRecords = locks.concat(links);

  const taskProps = {
    ...props,
    cancellable,
    resumable,
    id,
    taskProgressToggle,
    taskReloadStart,
  };

  return (
    <div className="task-details-react">
      <section className="task-details-overview-section">
        {isLoading ? <TaskSkeleton /> : <Task {...taskProps} />}
      </section>
      <Tabs
        aria-label={__('Task details')}
        id="task-details-tabs"
        ouiaId="task-details-tabs"
        activeKey={activeTab}
        mountOnEnter
        onSelect={(_e, tabKey) => setActiveTab(tabKey)}
      >
        <Tab
          isDisabled={isLoading}
          eventKey={TASK_DETAILS_TAB_KEYS.EXECUTION}
          title={<TabTitleText>{__('Execution details')}</TabTitleText>}
          aria-label={__('Execution details')}
          ouiaId="task-details-tab-execution-details"
        >
          {!isLoading && (
            <ExecutionDetails
              state={props.state}
              result={props.result}
              runningSteps={runningSteps}
              cancelStep={cancelStep}
              id={id}
              taskReload={taskReload}
              taskReloadStart={taskReloadStart}
              executionPlan={executionPlan}
              failedSteps={failedSteps}
            />
          )}
        </Tab>
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.DEPENDENCIES}
          isDisabled={isLoading}
          title={<TabTitleText>{__('Dependencies')}</TabTitleText>}
          aria-label={__('Dependencies')}
          ouiaId="task-details-tab-dependencies"
        >
          <Dependencies dependsOn={dependsOn} blocks={blocks} />
        </Tab>
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.LOCKS}
          title={<TabTitleText>{__('Locks')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Locks')}
          ouiaId="task-details-tab-locks"
        >
          <Locks locks={lockRecords} />
        </Tab>
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.RAW}
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
  result: PropTypes.string,
  runningSteps: PropTypes.array,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  apiStatus: PropTypes.oneOf(Object.keys(STATUS)),
  apiErrorMessage: PropTypes.string,
  apiErrorCode: PropTypes.number,
  taskReloadStop: PropTypes.func.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
  links: PropTypes.array,
  dependsOn: PropTypes.array,
  blocks: PropTypes.array,
  executionPlan: PropTypes.shape({}),
  failedSteps: PropTypes.array,
  ...Task.propTypes,
  ...Locks.propTypes,
  ...Raw.propTypes,
};
TaskDetails.defaultProps = {
  label: '',
  runningSteps: [],
  apiErrorMessage: '',
  links: [],
  dependsOn: [],
  blocks: [],
  failedSteps: [],
  executionPlan: {},
  ...Task.defaultProps,
  ...Locks.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

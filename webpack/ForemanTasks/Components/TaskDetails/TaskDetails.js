import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import Task from './Components/Task';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import ExecutionDetails from './ExecutionDetails';
import Dependencies from './Components/Dependencies';
import { getTaskID } from './TasksDetailsHelper';
import { TaskSkeleton } from './Components/TaskSkeleton';

import './TaskDetails.scss';

export const TASK_DETAILS_TAB_KEYS = Object.freeze({
  EXECUTION: 'execution',
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
  APIerror,
  ...props
}) => {
  const id = getTaskID();
  const { taskReload, status, isLoading } = props;
  const [activeTab, setActiveTab] = useState(TASK_DETAILS_TAB_KEYS.EXECUTION);

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
  const lockRecords = locks.concat(links);

  const taskProps = {
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
      <section className="task-details-overview-section">
        {isLoading ? <TaskSkeleton /> : <Task {...taskProps} />}
      </section>
      <Tabs
        aria-label={__('Task details')}
        ouiaId="task-details-secondary-tabs"
        id="task-details-tabs"
        className="pf-u-mt-xl"
        activeKey={activeTab}
        variant="secondary"
        mountOnEnter
        onSelect={(_e, tabKey) => setActiveTab(tabKey)}
      >
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.EXECUTION}
          ouiaId="task-details-tab-execution"
          title={<TabTitleText>{__('Execution details')}</TabTitleText>}
          aria-label={__('Execution details')}
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
              dependsOn={dependsOn}
              blocks={blocks}
              help={props.help}
              output={props.output}
              errors={props.errors}
            />
          )}
        </Tab>
        <Tab
          ouiaId="task-details-tab-dependencies"
          eventKey={5}
          disabled={isLoading}
          title={__('Dependencies')}
        >
          <Dependencies dependsOn={dependsOn} blocks={blocks} />
        </Tab>
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.LOCKS}
          ouiaId="task-details-tab-locks"
          title={<TabTitleText>{__('Locks')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Locks')}
        >
          <Locks locks={lockRecords} />
        </Tab>
        <Tab
          eventKey={TASK_DETAILS_TAB_KEYS.RAW}
          ouiaId="task-details-tab-raw"
          title={<TabTitleText>{__('Raw')}</TabTitleText>}
          isDisabled={isLoading}
          aria-label={__('Raw')}
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
  status: PropTypes.oneOf(Object.keys(STATUS)),
  APIerror: PropTypes.object,
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
  APIerror: null,
  status: STATUS.PENDING,
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

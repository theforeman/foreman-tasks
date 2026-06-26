import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { TaskButtons } from '../../Components/TaskDetails/Components/TaskButtons';
import { VIEW_FOREMAN_TASKS } from '../../Components/TaskDetails/TaskDetailsConstants';
import {
  ForceUnlockConfirmationModal,
  UnlockConfirmationModal,
} from '../../Components/common/ClickConfirmation';
import { taskResultIconEl } from '../../Components/common/taskResultIcon';
import './TaskDetailsHeader.scss';

const TitleComponent = ({ action, state, result }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    spaceItems={{ default: 'spaceItemsXs' }}
  >
    <FlexItem>
      <Title
        headingLevel="h1"
        className="foreman-tasks-task-details-header__title"
        ouiaId="task-overview-title"
      >
        {action || __('Task Details')}
      </Title>
    </FlexItem>
    <FlexItem>{taskResultIconEl(state, result)}</FlexItem>
  </Flex>
);

TitleComponent.propTypes = {
  action: PropTypes.string,
  state: PropTypes.string,
  result: PropTypes.string,
};

TitleComponent.defaultProps = {
  action: '',
  state: '',
  result: '',
};

const TaskDetailsHeader = props => {
  const {
    taskReload,
    id,
    forceCancelTaskRequest,
    unlockTaskRequest,
    action,
    taskReloadStart,
    taskReloadStop,
    executionPlan,
    apiStatus,
  } = props;
  const hasViewPermission = usePermissions([VIEW_FOREMAN_TASKS]);
  const showActions = hasViewPermission && apiStatus !== STATUS.ERROR;
  const resumable = executionPlan ? executionPlan.state === 'paused' : false;
  const cancellable = executionPlan ? executionPlan.cancellable : false;

  const forceUnlock = () => {
    if (!taskReload) {
      taskReloadStart(id);
    }

    forceCancelTaskRequest(id, action);
  };

  const unlock = () => {
    if (!taskReload) {
      taskReloadStart(id);
    }

    unlockTaskRequest(id, action);
  };

  const taskProgressToggle = () => {
    if (taskReload) {
      taskReloadStop();
    } else {
      taskReloadStart(id);
    }
  };

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [forceUnlockModalOpen, setForceUnlockModalOpen] = useState(false);

  return (
    <React.Fragment>
      {showActions && (
        <>
          <UnlockConfirmationModal
            onClick={unlock}
            isOpen={unlockModalOpen}
            setModalClosed={() => setUnlockModalOpen(false)}
          />
          <ForceUnlockConfirmationModal
            onClick={forceUnlock}
            isOpen={forceUnlockModalOpen}
            setModalClosed={() => setForceUnlockModalOpen(false)}
          />
        </>
      )}
      <Split
        className="foreman-tasks-task-details-header"
        hasGutter
        isWrappable
        data-ouia-component-id="foreman-tasks-task-details-title-row"
      >
        <SplitItem isFilled>
          <TitleComponent
            action={props.action}
            state={props.state}
            result={props.result}
          />
        </SplitItem>
        {showActions && (
          <SplitItem>
            <TaskButtons
              {...props}
              taskReloadStart={taskReloadStart}
              taskProgressToggle={taskProgressToggle}
              setUnlockModalOpen={setUnlockModalOpen}
              setForceUnlockModalOpen={setForceUnlockModalOpen}
              resumable={resumable}
              cancellable={cancellable}
            />
          </SplitItem>
        )}
      </Split>
    </React.Fragment>
  );
};

TaskDetailsHeader.propTypes = {
  taskReload: PropTypes.bool,
  id: PropTypes.string,
  forceCancelTaskRequest: PropTypes.func,
  unlockTaskRequest: PropTypes.func,
  action: PropTypes.string,
  state: PropTypes.string,
  result: PropTypes.string,
  taskReloadStart: PropTypes.func,
  taskReloadStop: PropTypes.func,
  executionPlan: PropTypes.shape({
    state: PropTypes.string,
    cancellable: PropTypes.bool,
  }),
  apiStatus: PropTypes.oneOf(Object.keys(STATUS)),
};

TaskDetailsHeader.defaultProps = {
  taskReload: false,
  id: '',
  forceCancelTaskRequest: () => null,
  unlockTaskRequest: () => null,
  action: '',
  state: '',
  result: '',
  taskReloadStart: () => null,
  taskReloadStop: () => null,
  executionPlan: {},
  apiStatus: STATUS.RESOLVED,
};

export default TaskDetailsHeader;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import TaskInfo from './TaskInfo';
import {
  ForceUnlockConfirmationModal,
  UnlockConfirmationModal,
} from '../../common/ClickConfirmation';
import { taskResultIconEl } from '../../common/taskResultIcon';
import { TaskButtons } from './TaskButtons';

const TitleComponent = ({ action, state, result }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    spaceItems={{ default: 'spaceItemsXs' }}
  >
    <FlexItem>
      <Title headingLevel="h4" size="md" ouiaId="task-overview-title">
        {action}
      </Title>
    </FlexItem>
    <FlexItem>{taskResultIconEl(state, result)}</FlexItem>
  </Flex>
);

TitleComponent.propTypes = {
  action: PropTypes.string.isRequired,
  state: PropTypes.string,
  result: PropTypes.string,
};

TitleComponent.defaultProps = {
  state: '',
  result: '',
};

const Task = props => {
  const {
    taskReload,
    id,
    forceCancelTaskRequest,
    unlockTaskRequest,
    action,
    taskReloadStart,
  } = props;
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
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [forceUnlockModalOpen, setForceUnlockModalOpen] = useState(false);

  return (
    <React.Fragment>
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
      <Stack hasGutter>
        <StackItem>
          <Split hasGutter isWrappable>
            <SplitItem isFilled>
              <TitleComponent
                action={props.action}
                state={props.state}
                result={props.result}
              />
            </SplitItem>
            <SplitItem>
              <TaskButtons
                taskReloadStart={taskReloadStart}
                setUnlockModalOpen={setUnlockModalOpen}
                setForceUnlockModalOpen={setForceUnlockModalOpen}
                {...props}
              />
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          <TaskInfo {...props} />
        </StackItem>
      </Stack>
    </React.Fragment>
  );
};

Task.propTypes = {
  taskReload: PropTypes.bool,
  id: PropTypes.string,
  forceCancelTaskRequest: PropTypes.func,
  unlockTaskRequest: PropTypes.func,
  action: PropTypes.string,
  state: PropTypes.string,
  result: PropTypes.string,
  taskReloadStart: PropTypes.func,
};

Task.defaultProps = {
  taskReload: false,
  id: '',
  forceCancelTaskRequest: () => null,
  unlockTaskRequest: () => null,
  action: '',
  state: '',
  result: '',
  taskReloadStart: () => null,
};

export default Task;

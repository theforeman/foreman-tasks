import React from 'react';
import { Grid, Row } from 'patternfly-react';
import TaskInfo from './TaskInfo';
import { ForceUnlockModal, UnlockModal } from '../../TaskActions/UnlockModals';
import { TaskButtons } from './TaskButtons';

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
  return (
    <React.Fragment>
      <UnlockModal onClick={unlock} />
      <ForceUnlockModal onClick={forceUnlock} />
      <Grid>
        <Row>
          <TaskButtons taskReloadStart={taskReloadStart} {...props} />
        </Row>
        <TaskInfo {...props} />
      </Grid>
    </React.Fragment>
  );
};

Task.propTypes = {
  ...TaskInfo.PropTypes,
  ...TaskButtons.PropTypes,
};

Task.defaultProps = {
  ...TaskInfo.defaultProps,
  ...TaskButtons.defaultProps,
};

export default Task;

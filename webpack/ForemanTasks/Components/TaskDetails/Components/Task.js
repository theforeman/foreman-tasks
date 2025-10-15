import React, { useState } from 'react';
import { Grid, Row } from 'patternfly-react';
import PropTypes from 'prop-types';
import TaskInfo from './TaskInfo';
import {
  ForceUnlockConfirmationModal,
  UnlockConfirmationModal,
} from '../../common/ClickConfirmation';
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
      <Grid>
        <Row>
          <TaskButtons
            taskReloadStart={taskReloadStart}
            setUnlockModalOpen={setUnlockModalOpen}
            setForceUnlockModalOpen={setForceUnlockModalOpen}
            {...props}
          />
        </Row>
        <TaskInfo {...props} />
      </Grid>
    </React.Fragment>
  );
};

Task.propTypes = {
  taskReload: PropTypes.bool,
  id: PropTypes.string,
  forceCancelTaskRequest: PropTypes.func,
  unlockTaskRequest: PropTypes.func,
  action: PropTypes.string,
  taskReloadStart: PropTypes.func,
};

Task.defaultProps = {
  taskReload: false,
  id: '',
  forceCancelTaskRequest: () => null,
  unlockTaskRequest: () => null,
  action: '',
  taskReloadStart: () => null,
};

export default Task;

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import { foremanUrl, urlBuilder } from 'foremanReact/common/urlHelpers';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import TaskInfo from './TaskInfo';
import {
  UNLOCK_MODAL,
  FORCE_UNLOCK_MODAL,
} from '../../TaskActions/TaskActionsConstants';
import { ForceUnlockModal, UnlockModal } from '../../TaskActions/UnlockModals';

const Task = props => {
  const taskProgressToggle = () => {
    const {
      timeoutId,
      refetchTaskDetails,
      id,
      loading,
      taskReloadStop,
      taskReloadStart,
    } = props;
    if (timeoutId) {
      taskReloadStop(timeoutId);
    } else {
      taskReloadStart(timeoutId, refetchTaskDetails, id, loading);
    }
  };

  const unlockModalActions = useForemanModal({
    id: UNLOCK_MODAL,
  });
  const forceUnlockModalActions = useForemanModal({
    id: FORCE_UNLOCK_MODAL,
  });

  const {
    taskReload,
    externalId,
    id,
    state,
    resumable,
    cancellable,
    hasSubTasks,
    parentTask,
    cancelTaskRequest,
    resumeTaskRequest,
    forceCancelTaskRequest,
    unlockTaskRequest,
    action,
    dynflowEnableConsole,
  } = props;
  const forceUnlock = () => {
    if (!taskReload) {
      taskProgressToggle();
    }
    forceCancelTaskRequest(id, action);
  };
  const unlock = () => {
    if (!taskReload) {
      taskProgressToggle();
    }
    unlockTaskRequest(id, action);
  };
  return (
    <React.Fragment>
      <UnlockModal onClick={unlock} />
      <ForceUnlockModal onClick={forceUnlock} />
      <Grid>
        <Row>
          <Col xs={12}>
            <Button
              className="reload-button"
              bsSize="small"
              onClick={taskProgressToggle}
            >
              <span
                className={`glyphicon glyphicon-refresh ${
                  taskReload ? 'spin' : ''
                }`}
              />
              {__(`${taskReload ? 'Stop' : 'Start'}  auto-reloading`)}
            </Button>
            <Button
              className="dynflow-button"
              bsSize="small"
              href={foremanUrl(`/foreman_tasks/dynflow/${externalId}`)}
              disabled={!dynflowEnableConsole}
            >
              {__('Dynflow console')}
            </Button>
            <Button
              className="resume-button"
              bsSize="small"
              disabled={!resumable}
              onClick={() => {
                if (!taskReload) {
                  taskProgressToggle();
                }
                resumeTaskRequest(id, action);
              }}
            >
              {__('Resume')}
            </Button>
            <Button
              className="cancel-button"
              bsSize="small"
              disabled={!cancellable}
              onClick={() => {
                if (!taskReload) {
                  taskProgressToggle();
                }
                cancelTaskRequest(id, action);
              }}
            >
              {__('Cancel')}
            </Button>
            {parentTask && (
              <Button
                className="parent-button"
                bsSize="small"
                href={foremanUrl(`/foreman_tasks/tasks/${parentTask}`)}
              >
                {__('Parent task')}
              </Button>
            )}
            {hasSubTasks && (
              <Button
                className="subtask-button"
                bsSize="small"
                href={urlBuilder('/foreman_tasks/tasks', 'sub_tasks', id)}
              >
                {__('Sub tasks')}
              </Button>
            )}
            <Button
              className="unlock-button"
              bsSize="small"
              disabled={state !== 'paused'}
              onClick={unlockModalActions.setModalOpen}
            >
              {__('Unlock')}
            </Button>
            <Button
              className="force-unlock-button"
              bsSize="small"
              disabled={state === 'stopped'}
              onClick={forceUnlockModalActions.setModalOpen}
            >
              {__('Force Unlock')}
            </Button>
          </Col>
        </Row>
        <TaskInfo {...props} />
      </Grid>
    </React.Fragment>
  );
};

Task.propTypes = {
  ...TaskInfo.PropTypes,
  state: PropTypes.string,
  resumable: PropTypes.bool,
  cancellable: PropTypes.bool,
  refetchTaskDetails: PropTypes.func,
  hasSubTasks: PropTypes.bool,
  parentTask: PropTypes.string,
  taskReload: PropTypes.bool,
  taskReloadStop: PropTypes.func,
  taskReloadStart: PropTypes.func,
  timeoutId: PropTypes.number,
  externalId: PropTypes.string,
  id: PropTypes.string.isRequired,
  cancelTaskRequest: PropTypes.func,
  resumeTaskRequest: PropTypes.func,
  dynflowEnableConsole: PropTypes.bool,
};

Task.defaultProps = {
  ...TaskInfo.defaultProps,
  state: '',
  resumable: false,
  cancellable: false,
  refetchTaskDetails: () => null,
  hasSubTasks: false,
  parentTask: '',
  taskReload: false,
  taskReloadStop: () => null,
  taskReloadStart: () => null,
  timeoutId: null,
  externalId: '',
  cancelTaskRequest: () => null,
  resumeTaskRequest: () => null,
  dynflowEnableConsole: false,
};

export default Task;

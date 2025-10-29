import React from 'react';
import PropTypes from 'prop-types';
import { Col, Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

export const TaskButtons = ({
  canEdit,
  dynflowEnableConsole,
  taskReloadStart,
  taskProgressToggle,
  taskReload,
  externalId,
  id,
  action,
  state,
  resumable,
  cancellable,
  hasSubTasks,
  parentTask,
  cancelTaskRequest,
  resumeTaskRequest,
  setUnlockModalOpen,
  setForceUnlockModalOpen,
}) => {
  const editActionsTitle = canEdit
    ? undefined
    : __('You do not have permission');
  const dynflowTitle = dynflowEnableConsole
    ? undefined
    : `dynflow_enable_console ${__('Setting is off')}`;

  return (
    <Col xs={12}>
      <Button
        className="reload-button"
        bsSize="small"
        onClick={taskProgressToggle}
      >
        <span
          className={`glyphicon glyphicon-refresh ${taskReload ? 'spin' : ''}`}
        />
        {taskReload ? __('Stop auto-reloading') : __('Start auto-reloading')}
      </Button>
      <Button
        className="dynflow-button"
        bsSize="small"
        href={`/foreman_tasks/dynflow/${externalId}`}
        disabled={!dynflowEnableConsole}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span title={dynflowTitle} data-original-title={dynflowTitle}>
          {__('Dynflow console')}
        </span>
      </Button>
      <Button
        className="resume-button"
        bsSize="small"
        title={editActionsTitle}
        data-original-title={editActionsTitle}
        disabled={!canEdit || !resumable}
        onClick={() => {
          if (!taskReload) {
            taskReloadStart(id);
          }
          resumeTaskRequest(id, action);
        }}
      >
        {__('Resume')}
      </Button>
      <Button
        className="cancel-button"
        bsSize="small"
        title={editActionsTitle}
        data-original-title={editActionsTitle}
        disabled={!canEdit || !cancellable}
        onClick={() => {
          if (!taskReload) {
            taskReloadStart(id);
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
          href={`/foreman_tasks/tasks/${parentTask}`}
        >
          {__('Parent task')}
        </Button>
      )}
      {hasSubTasks && (
        <Button
          className="subtask-button"
          bsSize="small"
          href={`/foreman_tasks/tasks/${id}/sub_tasks`}
        >
          {__('Sub tasks')}
        </Button>
      )}
      <Button
        className="unlock-button"
        bsSize="small"
        disabled={!canEdit || state !== 'paused'}
        onClick={() => {
          setUnlockModalOpen(true);
        }}
        title={editActionsTitle}
        data-original-title={editActionsTitle}
      >
        {__('Unlock')}
      </Button>
      <Button
        className="force-unlock-button"
        bsSize="small"
        disabled={!canEdit || state === 'stopped'}
        onClick={() => setForceUnlockModalOpen(true)}
        title={editActionsTitle}
        data-original-title={editActionsTitle}
      >
        {__('Force Unlock')}
      </Button>
    </Col>
  );
};

export const TaskButtonspropTypes = {
  canEdit: PropTypes.bool,
  dynflowEnableConsole: PropTypes.bool,
  taskReloadStart: PropTypes.func.isRequired,
  taskProgressToggle: PropTypes.func.isRequired,
  taskReload: PropTypes.bool,
  externalId: PropTypes.string,
  id: PropTypes.string.isRequired,
  action: PropTypes.string,
  state: PropTypes.string,
  resumable: PropTypes.bool,
  cancellable: PropTypes.bool,
  hasSubTasks: PropTypes.bool,
  parentTask: PropTypes.string,
  cancelTaskRequest: PropTypes.func,
  resumeTaskRequest: PropTypes.func,
};
export const TaskButtonsdefaultProps = {
  canEdit: false,
  dynflowEnableConsole: false,
  taskReload: false,
  externalId: '',
  action: '',
  state: '',
  resumable: false,
  cancellable: false,
  hasSubTasks: false,
  parentTask: '',
  cancelTaskRequest: () => null,
  resumeTaskRequest: () => null,
};

TaskButtons.propTypes = {
  ...TaskButtonspropTypes,
  setUnlockModalOpen: PropTypes.func,
  setForceUnlockModalOpen: PropTypes.func,
};
TaskButtons.defaultProps = {
  setUnlockModalOpen: () => null,
  setForceUnlockModalOpen: () => null,
  ...TaskButtonsdefaultProps,
};

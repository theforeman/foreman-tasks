import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
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
    <>
      <Button
        variant="secondary"
        ouiaId="task-buttons-reload-button"
        className="reload-button"
        size="sm"
        onClick={taskProgressToggle}
      >
        <Icon className={taskReload ? 'spin' : ''}>
          <SyncAltIcon />
        </Icon>
        {taskReload ? __('Stop auto-reloading') : __('Start auto-reloading')}
      </Button>
      <Button
        variant="secondary"
        ouiaId="task-buttons-dynflow-button"
        className="dynflow-button"
        size="sm"
        component="a"
        href={`/foreman_tasks/dynflow/${externalId}`}
        isDisabled={!dynflowEnableConsole}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span title={dynflowTitle} data-original-title={dynflowTitle}>
          {__('Dynflow console')}
        </span>
      </Button>
      <Button
        variant="secondary"
        ouiaId="task-buttons-resume-button"
        className="resume-button"
        size="sm"
        title={editActionsTitle}
        data-original-title={editActionsTitle}
        isDisabled={!canEdit || !resumable}
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
        variant="secondary"
        ouiaId="task-buttons-cancel-button"
        className="cancel-button"
        size="sm"
        title={editActionsTitle}
        data-original-title={editActionsTitle}
        isDisabled={!canEdit || !cancellable}
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
          variant="secondary"
          ouiaId="task-buttons-parent-button"
          className="parent-button"
          size="sm"
          href={`/foreman_tasks/tasks/${parentTask}`}
          component="a"
        >
          {__('Parent task')}
        </Button>
      )}
      {hasSubTasks && (
        <Button
          variant="secondary"
          ouiaId="task-buttons-subtask-button"
          className="subtask-button"
          size="sm"
          href={`/foreman_tasks/tasks/${id}/sub_tasks`}
          component="a"
        >
          {__('Sub tasks')}
        </Button>
      )}
      <Button
        variant="secondary"
        ouiaId="task-buttons-unlock-button"
        className="unlock-button"
        size="sm"
        isDisabled={!canEdit || state !== 'paused'}
        onClick={() => {
          setUnlockModalOpen(true);
        }}
        title={editActionsTitle}
        data-original-title={editActionsTitle}
      >
        {__('Unlock')}
      </Button>
      <Button
        variant="secondary"
        ouiaId="task-buttons-force-unlock-button"
        className="force-unlock-button"
        size="sm"
        isDisabled={!canEdit || state === 'stopped'}
        onClick={() => setForceUnlockModalOpen(true)}
        title={editActionsTitle}
        data-original-title={editActionsTitle}
      >
        {__('Force Unlock')}
      </Button>
    </>
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

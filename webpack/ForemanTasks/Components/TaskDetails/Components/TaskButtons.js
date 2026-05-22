import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { SimpleDropdown } from '@patternfly/react-templates';
import { EllipsisVIcon, SyncAltIcon } from '@patternfly/react-icons';
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

  const overflowItems = [
    {
      value: 'reload',
      content: (
        <>
          <Icon className={taskReload ? 'spin' : ''}>
            <SyncAltIcon />
          </Icon>
          &nbsp;
          {taskReload ? __('Stop auto-reloading') : __('Start auto-reloading')}
        </>
      ),
      onClick: taskProgressToggle,
    },
    {
      value: 'resume',
      content: __('Resume'),
      onClick: () => {
        if (!taskReload) {
          taskReloadStart(id);
        }

        resumeTaskRequest(id, action);
      },
      isDisabled: !canEdit || !resumable,
      tooltip: editActionsTitle,
    },
    ...(parentTask
      ? [
          {
            value: 'parent',
            content: __('Parent task'),
            onClick: () => {
              window.location.assign(`/foreman_tasks/tasks/${parentTask}`);
            },
          },
        ]
      : []),
    ...(hasSubTasks
      ? [
          {
            value: 'subtasks',
            content: __('Sub tasks'),
            onClick: () => {
              window.location.assign(`/foreman_tasks/tasks/${id}/sub_tasks`);
            },
          },
        ]
      : []),
    {
      value: 'unlock',
      content: __('Unlock'),
      onClick: () => setUnlockModalOpen(true),
      isDisabled: !canEdit || state !== 'paused',
      tooltip: editActionsTitle,
    },
    {
      value: 'force-unlock',
      content: __('Force Unlock'),
      onClick: () => setForceUnlockModalOpen(true),
      isDisabled: !canEdit || state === 'stopped',
      tooltip: editActionsTitle,
    },
  ];

  return (
    <Flex
      display={{ default: 'inlineFlex' }}
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
      className="task-buttons-toolbar"
    >
      <FlexItem>
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
      </FlexItem>
      <FlexItem>
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
      </FlexItem>
      <FlexItem>
        <SimpleDropdown
          ouiaId="task-buttons-overflow-dropdown"
          toggleVariant="plain"
          toggleContent={<EllipsisVIcon aria-hidden="true" />}
          popperProps={{ position: 'right' }}
          initialItems={overflowItems}
          toggleProps={{ 'aria-label': __('Task actions') }}
        />
      </FlexItem>
    </Flex>
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

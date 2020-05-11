import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { ActionButtons } from 'foremanReact/components/common/ActionButtons/ActionButtons';

export const ActionButton = ({
  id,
  name,
  availableActions: { resumable, cancellable, stoppable },
  taskActions,
}) => {
  const buttons = [];
  const isTitle = !(resumable || cancellable || stoppable);
  const title = isTitle ? __('Task cannot be canceled') : undefined;
  if (resumable) {
    buttons.push({
      title: __('Resume'),
      action: {
        disabled: !resumable,
        onClick: () => taskActions.resumeTask(id, name),
        id: `task-resume-button-${id}`,
      },
    });
  }
  if (cancellable || (!stoppable && !resumable)) {
    // Cancel is the default button that should be shown if no task action can be done
    buttons.push({
      title: __('Cancel'),
      action: {
        disabled: !cancellable,
        onClick: () => taskActions.cancelTask(id, name),
        id: `task-cancel-button-${id}`,
      },
    });
  }

  if (stoppable) {
    buttons.push({
      title: __('Force Cancel'),
      action: {
        disabled: !stoppable,
        onClick: () => taskActions.forceCancelTask(id, name),
        id: `task-force-cancel-button-${id}`,
      },
    });
  }
  return (
    <span title={title}>
      <ActionButtons buttons={buttons} />
    </span>
  );
};

ActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  availableActions: PropTypes.shape({
    cancellable: PropTypes.bool,
    resumable: PropTypes.bool,
    stoppable: PropTypes.bool,
  }).isRequired,
  taskActions: PropTypes.shape({
    cancelTask: PropTypes.func,
    resumeTask: PropTypes.func,
    forceCancelTask: PropTypes.func,
  }).isRequired,
};

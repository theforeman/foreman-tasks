import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { ActionButtons } from 'foremanReact/components/common/ActionButtons/ActionButtons';

export const ActionButton = ({
  id,
  name,
  availableActions: { resumable, cancellable },
  taskActions,
}) => {
  const buttons = [];
  const title =
    !resumable && !cancellable ? __('Task cannot be canceled') : undefined;
  if (resumable) {
    buttons.push({
      title: __('Resume'),
      action: {
        disabled: !resumable,
        onClick: () => taskActions.resumeTask(id, name),
      },
    });
  }
  if (cancellable || !resumable) {
    buttons.push({
      title: __('Cancel'),
      action: {
        disabled: !cancellable,
        onClick: () => taskActions.cancelTask(id, name),
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
  }).isRequired,
  taskActions: PropTypes.shape({
    cancelTask: PropTypes.func,
    resumeTask: PropTypes.func,
  }).isRequired,
};

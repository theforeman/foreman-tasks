import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { ActionButtons } from 'foremanReact/components/common/ActionButtons/ActionButtons';

export const ActionButton = ({ id, name, availableActions, modalActions }) => {
  const isResume = availableActions.resumable;
  const isCancel = availableActions.cancellable;
  const buttons = [];
  if (isResume) {
    buttons.push({
      title: __('Resume'),
      action: {
        disabled: !isResume,
        onClick: () => modalActions.resumeTask(id, name),
      },
    });
  }
  if (isCancel || !isResume) {
    buttons.push({
      title: __('Cancel'),
      action: {
        disabled: !isCancel,
        onClick: () => modalActions.cancelTask(id, name),
      },
    });
  }
  return <ActionButtons buttons={buttons} />;
};

ActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  availableActions: PropTypes.shape({
    cancellable: PropTypes.bool,
    resumable: PropTypes.bool,
  }).isRequired,
  modalActions: PropTypes.shape({
    cancelTask: PropTypes.func,
    resumeTask: PropTypes.func,
  }).isRequired,
};

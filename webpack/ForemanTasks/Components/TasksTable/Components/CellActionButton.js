import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { ActionButtons } from 'foremanReact/components/common/ActionButtons/ActionButtons';
import {
  RESUME_MODAL,
  CANCEL_MODAL,
  FORCE_UNLOCK_MODAL,
} from '../TasksTableConstants';

export const CellActionButton = ({
  id,
  action,
  canEdit,
  resumable,
  cancellable,
  stoppable,
  setClickedTask,
  openModal,
}) => {
  const buttons = [];
  const isTitle = canEdit && !(resumable || cancellable || stoppable);
  const title = isTitle ? __('Task cannot be canceled') : undefined;
  if (canEdit) {
    if (resumable) {
      buttons.push({
        title: __('Resume'),
        action: {
          disabled: !resumable,
          onClick: () => {
            setClickedTask({ id, action });
            openModal(RESUME_MODAL);
          },
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
          onClick: () => {
            setClickedTask({ id, action });
            openModal(CANCEL_MODAL);
          },
          id: `task-cancel-button-${id}`,
        },
      });
    }

    if (stoppable) {
      buttons.push({
        title: __('Force Cancel'),
        action: {
          disabled: !stoppable,
          onClick: () => {
            setClickedTask({ id, action });
            openModal(FORCE_UNLOCK_MODAL);
          },
          id: `task-force-cancel-button-${id}`,
        },
      });
    }
  }
  return (
    <span title={title}>
      <ActionButtons buttons={buttons} />
    </span>
  );
};

CellActionButton.propTypes = {
  canEdit: PropTypes.bool,
  id: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  resumable: PropTypes.bool,
  cancellable: PropTypes.bool,
  stoppable: PropTypes.bool,
  setClickedTask: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
};

CellActionButton.defaultProps = {
  canEdit: false,
  resumable: false,
  cancellable: false,
  stoppable: false,
};

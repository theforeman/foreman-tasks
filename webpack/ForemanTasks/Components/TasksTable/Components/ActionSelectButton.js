import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { ActionButtons } from 'foremanReact/components/common/ActionButtons/ActionButtons';

export const ActionSelectButton = ({
  onCancel,
  onResume,
  onForceCancel,
  disabled,
}) => {
  const buttons = [
    {
      title: __('Select Action'),
      action: {
        onClick: () => {},
      },
    },
    {
      title: __('Cancel Selected'),
      action: {
        onClick: onCancel,
      },
    },
    {
      title: __('Resume Selected'),
      action: {
        onClick: onResume,
      },
    },
    {
      title: __('Force Cancel Selected'),
      action: {
        onClick: onForceCancel,
      },
    },
  ];

  return <ActionButtons buttons={buttons} />;
};

ActionSelectButton.propTypes = {
  disabled: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onForceCancel: PropTypes.func.isRequired,
};

ActionSelectButton.defaultProps = {
  disabled: false,
};

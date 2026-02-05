import React from 'react';
import PropTypes from 'prop-types';
import { SimpleDropdown } from '@patternfly/react-templates';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';

export const ActionSelectButton = ({
  onCancel,
  onResume,
  onForceCancel,
  disabled,
}) => {
  const buttons = [
    {
      content: __('Cancel Selected'),
      onClick: onCancel,
      value: 1,
    },
    {
      content: __('Resume Selected'),
      onClick: onResume,
      value: 2,
    },
    {
      content: __('Force Cancel Selected'),
      onClick: onForceCancel,
      value: 3,
    },
  ];
  return (
    <SimpleDropdown
      isDisabled={disabled}
      ouiaId="tasks-table-action-select-dropdown"
      toggleVariant="plain"
      popperProps={{ position: 'right' }}
      initialItems={buttons}
      toggleContent={<EllipsisVIcon aria-hidden="true" />}
    />
  );
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

import React from 'react';
import { DropdownButton, MenuItem } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';

export const ActionSelectButton = ({ onCancel, onResume, disabled }) => (
  <DropdownButton
    title={__('Select Action')}
    disabled={disabled}
    id="selcted-action-type"
  >
    <MenuItem
      title={__('Cancel selected tasks')}
      onClick={onCancel}
      eventKey="1"
    >
      {__('Cancel Selected')}
    </MenuItem>
    <MenuItem
      title={__('Resume selected tasks')}
      onClick={onResume}
      eventKey="2"
    >
      {__('Resume Selected')}
    </MenuItem>
  </DropdownButton>
);

ActionSelectButton.propTypes = {
  disabled: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
};

ActionSelectButton.defaultProps = {
  disabled: false,
};

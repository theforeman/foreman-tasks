import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { noop } from 'foremanReact/common/helpers';

export const CancelButton = ({ id, name, disabled, onClick }) => (
  <Button bsSize="small" onClick={() => onClick(id, name)} disabled={disabled}>
    {__('Cancel')}
  </Button>
);

CancelButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

CancelButton.defaultProps = {
  disabled: false,
  onClick: noop,
};

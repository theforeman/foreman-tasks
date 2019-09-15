import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import { noop } from 'foremanReact/common/helpers';

export const ResumeButton = ({ id, name, disabled, onClick }) => (
  <Button bsSize="small" onClick={() => onClick(id, name)} disabled={disabled}>
    {__('Resume')}
  </Button>
);

ResumeButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

ResumeButton.defaultProps = {
  disabled: false,
  onClick: noop,
};

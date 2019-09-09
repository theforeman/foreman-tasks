import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';

export const Cancel = ({ id, name, cancellable, cancelTaskAction }) => (
  <Button
    bsSize="small"
    onClick={() => cancelTaskAction(id, name)}
    disabled={!cancellable}
  >
    {__('Cancel')}
  </Button>
);

Cancel.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  cancellable: PropTypes.bool.isRequired,
  cancelTaskAction: PropTypes.func.isRequired,
};

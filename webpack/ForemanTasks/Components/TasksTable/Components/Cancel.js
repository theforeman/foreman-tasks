import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';

export const Cancel = ({ id, cancellable }) => (
  <Button
    bsSize="small"
    data-method="post"
    href={`/foreman_tasks/tasks/${id}/cancel`}
    disabled={!cancellable}
  >
    {__('Cancel')}
  </Button>
);

Cancel.propTypes = {
  id: PropTypes.string.isRequired,
  cancellable: PropTypes.bool.isRequired,
};

import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';

export const ExportButton = ({ url }) => (
  <Button className="export-csv" href={url} title={__('Export to CSV')}>
    {__('Export')}
  </Button>
);

ExportButton.propTypes = {
  url: PropTypes.string.isRequired,
};

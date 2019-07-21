import React from 'react';
import { Button } from 'patternfly-react';
import PropTypes from 'prop-types';

export const ExportButton = ({ url }) => (
  <Button
    className="export-csv"
    data-no-turbolink="true"
    href={url}
    title={__('Export to CSV')}
  >
    {__('Export')}
  </Button>
);

ExportButton.propTypes = {
  url: PropTypes.string.isRequired,
};

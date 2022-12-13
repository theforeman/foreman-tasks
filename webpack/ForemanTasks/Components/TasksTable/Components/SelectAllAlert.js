import { FormattedMessage } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'patternfly-react';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';

export const SelectAllAlert = ({
  itemCount,
  perPage,
  selectAllRows,
  unselectAllRows,
  allRowsSelected,
}) => {
  const selectAllText = (
    <React.Fragment>
      {sprintf(
        'All %s tasks on this page are selected',
        Math.min(itemCount, perPage)
      )}
      <Button bsStyle="link" onClick={selectAllRows}>
        <FormattedMessage
          id="select-all-tasks"
          values={{
            count: <b>{itemCount}</b>,
          }}
          defaultMessage={__('Select all {count} tasks')}
        />
      </Button>
    </React.Fragment>
  );
  const undoSelectText = (
    <React.Fragment>
      {sprintf(__('All %s tasks are selected.'), itemCount)}
      <Button bsStyle="link" onClick={unselectAllRows}>
        {__('Undo selection')}
      </Button>
    </React.Fragment>
  );
  const selectAlertText = allRowsSelected ? undoSelectText : selectAllText;
  return <Alert type="info">{selectAlertText}</Alert>;
};

SelectAllAlert.propTypes = {
  allRowsSelected: PropTypes.bool.isRequired,
  itemCount: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  selectAllRows: PropTypes.func.isRequired,
  unselectAllRows: PropTypes.func.isRequired,
};

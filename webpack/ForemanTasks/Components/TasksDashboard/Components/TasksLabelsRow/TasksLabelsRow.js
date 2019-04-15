import React from 'react';
import PropTypes from 'prop-types';
import { Row, Button, Label } from 'patternfly-react';
import { noop } from 'foremanReact/common/helpers';
import { translate as __ } from 'foremanReact/common/I18n';

import { getQueryKeyText, getQueryValueText } from '../../TasksDashboardHelper';
import { queryPropType } from '../../TasksDashboardPropTypes';
import './TasksLabelsRow.scss';

const TasksLabelsRow = ({ query, updateQuery }) => {
  const onDeleteClick = keyToDelete => {
    const { [keyToDelete]: deleted, ...queryWithoutDeleted } = query;
    updateQuery(queryWithoutDeleted);
  };

  const getLabelText = (key, value) => {
    const translatedKey = getQueryKeyText(key);
    const translatedValue = getQueryValueText(value);

    return `${translatedKey} = ${translatedValue}`;
  };

  const queryEntries = Object.entries(query);

  return (
    <Row className="tasks-labels-row">
      <span className="title">{__('Active Filters:')}</span>
      {queryEntries.map(([key, value]) => (
        <Label
          bsStyle="info"
          key={key}
          onRemoveClick={() => onDeleteClick(key)}
        >
          {getLabelText(key, value)}
        </Label>
      ))}
      {queryEntries.length > 0 && (
        <Button bsStyle="link" onClick={() => updateQuery({})}>
          {__('Clear All Filters')}
        </Button>
      )}
    </Row>
  );
};

TasksLabelsRow.propTypes = {
  query: queryPropType,
  updateQuery: PropTypes.func,
};

TasksLabelsRow.defaultProps = {
  query: {},
  updateQuery: noop,
};

export default TasksLabelsRow;

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Button, Label } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

import { TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT } from '../../TasksDashboardConstants';
import { queryPropType } from '../../TasksDashboardPropTypes';
import './TasksLabelsRow.scss';

const TasksLabelsRow = ({ query, updateQuery }) => {
  const onDeleteClick = value => {
    const { [value]: deleted, ...queryWithoutDeleted } = query;
    updateQuery(queryWithoutDeleted);
  };

  return (
    <Row className="tasks-labels-row">
      <span className="title">{__('Active Filters:')}</span>
      {Object.entries(query).map(([key, value]) => (
        <Label
          bsStyle="info"
          key={key}
          onRemoveClick={() => onDeleteClick(key)}
        >
          {__(
            `${key} = ${
              key === 'time'
                ? TASKS_DASHBOARD_AVAILABLE_TIMES_TEXT[value]
                : value
            }`
          )}
        </Label>
      ))}
      {Object.entries(query).length > 0 && (
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
  updateQuery: () => null,
};

export default TasksLabelsRow;

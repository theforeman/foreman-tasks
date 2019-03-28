import React from 'react';
import PropTypes from 'prop-types';
import { Row, CompoundLabel } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

import { queryPropType } from '../../TasksDashboardPropTypes';
import './TasksLabelsRow.scss';

const TasksLabelsRow = ({ query, updateQuery }) => {
  const values = Object.entries(query).map(([key, value]) => ({
    id: key,
    label: `${key} = ${value}`,
  }));

  const onDeleteClick = (category, value) => {
    const { [value.id]: deleted, ...queryWithoutDeleted } = query;
    updateQuery(queryWithoutDeleted);
  };

  return (
    <Row className="tasks-labels-row">
      <CompoundLabel
        category={{ id: 'tasks-query-labels', label: __('Active Filters:') }}
        values={values}
        onDeleteClick={onDeleteClick}
      />
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

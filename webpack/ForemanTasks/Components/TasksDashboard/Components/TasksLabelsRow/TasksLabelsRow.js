import React from 'react';
import PropTypes from 'prop-types';
import { Label, LabelGroup } from '@patternfly/react-core';
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
    <LabelGroup
      className="tasks-labels-row"
      categoryName={__('Active Filters')}
      isClosable
      onClick={() => updateQuery({})}
    >
      {queryEntries.map(([key, value]) => (
        <Label color="blue" key={key} onClose={() => onDeleteClick(key)}>
          {getLabelText(key, value)}
        </Label>
      ))}
    </LabelGroup>
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

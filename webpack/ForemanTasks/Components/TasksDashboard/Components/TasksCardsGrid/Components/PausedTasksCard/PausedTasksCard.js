import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';

const PausedTasksCard = ({ ...props }) => (
  <TasksDonutCard
    title={__('Paused')}
    wantedQueryState="paused"
    id="paused-tasks-card"
    {...props}
  />
);

const filterUnwantedFields = obj => {
  const { title, wantedQueryState, ...newObj } = obj;
  return newObj;
};

PausedTasksCard.propTypes = filterUnwantedFields(TasksDonutCard.propTypes);
PausedTasksCard.defaultProps = filterUnwantedFields(
  TasksDonutCard.defaultProps
);

export default PausedTasksCard;

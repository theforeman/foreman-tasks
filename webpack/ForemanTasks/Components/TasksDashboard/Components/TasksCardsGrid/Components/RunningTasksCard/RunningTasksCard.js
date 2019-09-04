import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';

const RunningTasksCard = ({ ...props }) => (
  <TasksDonutCard
    title={__('Running')}
    wantedQueryState="running"
    id="running-tasks-card"
    {...props}
  />
);

const filterUnwantedFields = obj => {
  const { title, wantedQueryState, ...newObj } = obj;
  return newObj;
};

RunningTasksCard.propTypes = filterUnwantedFields(TasksDonutCard.propTypes);
RunningTasksCard.defaultProps = filterUnwantedFields(
  TasksDonutCard.defaultProps
);

export default RunningTasksCard;

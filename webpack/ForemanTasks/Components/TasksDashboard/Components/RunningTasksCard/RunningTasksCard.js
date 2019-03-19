import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';

const RunningTasksCard = ({ ...props }) => (
  <TasksDonutCard title={__('Running')} {...props} />
);

const filterTitle = obj => {
  const { title, ...newObj } = obj;
  return newObj;
};

RunningTasksCard.propTypes = {
  ...filterTitle(TasksDonutCard.propTypes),
};
RunningTasksCard.defaultProps = {
  ...filterTitle(TasksDonutCard.defaultProps),
};
export default RunningTasksCard;

import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';

const PausedTasksCard = ({ ...props }) => (
  <TasksDonutCard title={__('Paused')} {...props} />
);

const filterTitle = obj => {
  const { title, ...newObj } = obj;
  return newObj;
};

PausedTasksCard.propTypes = {
  ...filterTitle(TasksDonutCard.propTypes),
};
PausedTasksCard.defaultProps = {
  ...filterTitle(TasksDonutCard.defaultProps),
};

export default PausedTasksCard;

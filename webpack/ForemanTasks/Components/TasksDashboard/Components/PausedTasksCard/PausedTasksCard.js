import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../TasksDashboardConstants';
import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';
import { queryPropType } from '../../TasksDashboardPropTypes';
import { getFocusedOn } from '../TasksDonutChart/TasksDonutChartHelper';

const PausedTasksCard = ({ query, ...props }) => (
  <TasksDonutCard
    title={__('Paused')}
    {...props}
    focusedOn={getFocusedOn(
      query,
      TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED
    )}
  />
);

const filterTitle = obj => {
  const { title, ...newObj } = obj;
  return newObj;
};

PausedTasksCard.propTypes = {
  ...filterTitle(TasksDonutCard.propTypes),
  query: queryPropType,
};
PausedTasksCard.defaultProps = {
  ...filterTitle(TasksDonutCard.defaultProps),
  query: {},
};

export default PausedTasksCard;

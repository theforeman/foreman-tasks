import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../TasksDashboardConstants';
import TasksDonutCard from '../TasksDonutCard/TasksDonutCard';
import { queryPropType } from '../../TasksDashboardPropTypes';
import { getFocusedOn } from '../TasksDonutChart/TasksDonutChartHelper';

const RunningTasksCard = ({ query, ...props }) => (
  <TasksDonutCard
    title={__('Running')}
    focusedOn={getFocusedOn(
      query,
      TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING
    )}
    {...props}
  />
);

const filterTitle = obj => {
  const { title, ...newObj } = obj;
  return newObj;
};

RunningTasksCard.propTypes = {
  ...filterTitle(TasksDonutCard.propTypes),
  query: queryPropType,
};
RunningTasksCard.defaultProps = {
  ...filterTitle(TasksDonutCard.defaultProps),
  query: {},
};
export default RunningTasksCard;

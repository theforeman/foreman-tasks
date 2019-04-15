import React from 'react';
import PropTypes from 'prop-types';
import { CardGrid } from 'patternfly-react';
import { noop } from 'foremanReact/common/helpers';

import RunningTasksCard from './Components/RunningTasksCard/RunningTasksCard';
import PausedTasksCard from './Components/PausedTasksCard/PausedTasksCard';
import StoppedTasksCard from './Components/StoppedTasksCard/StoppedTasksCard';
import ScheduledTasksCard from './Components/ScheduledTasksCard/ScheduledTasksCard';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../TasksDashboardConstants';
import { timePropType, queryPropType } from '../../TasksDashboardPropTypes';

const TasksCardsGrid = ({ time, query, data, updateQuery }) => (
  <CardGrid matchHeight fluid>
    <CardGrid.Row>
      {[
        [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING, RunningTasksCard],
        [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED, PausedTasksCard],
        [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.STOPPED, StoppedTasksCard],
        [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED, ScheduledTasksCard],
      ].map(([key, Card]) => (
        <CardGrid.Col sm={6} lg={3} key={key}>
          <Card
            matchHeight
            data={data[key]}
            query={query}
            time={time}
            updateQuery={updateQuery}
          />
        </CardGrid.Col>
      ))}
    </CardGrid.Row>
  </CardGrid>
);

TasksCardsGrid.propTypes = {
  time: timePropType,
  query: queryPropType,
  data: PropTypes.shape({
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING]:
      RunningTasksCard.propTypes.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED]:
      PausedTasksCard.propTypes.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.STOPPED]:
      StoppedTasksCard.propTypes.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED]:
      ScheduledTasksCard.propTypes.data,
  }),
  updateQuery: PropTypes.func,
};

TasksCardsGrid.defaultProps = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
  data: {
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING]:
      RunningTasksCard.defaultProps.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED]:
      PausedTasksCard.defaultProps.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.STOPPED]:
      StoppedTasksCard.defaultProps.data,
    [TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED]:
      ScheduledTasksCard.defaultProps.data,
  },
  updateQuery: noop,
};

export default TasksCardsGrid;

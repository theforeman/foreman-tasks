import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import TasksTimeRow from './Components/TasksTimeRow/TasksTimeRow';
import TasksCardsGrid from './Components/TasksCardsGrid/TasksCardsGrid';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from './TasksDashboardConstants';
import { getQueryFromUrl } from './TasksDashboardHelper';
import { timePropType, queryPropType } from './TasksDashboardPropTypes';
import './TasksDashboard.scss';

class TasksDashboard extends React.Component {
  componentDidMount() {
    const query = getQueryFromUrl();

    this.props.initializeDashboard({
      time: query.time,
      query,
    });
  }

  render() {
    const { time, query, data, updateTime, updateQuery } = this.props;

    return (
      <Grid fluid className="tasks-dashboard-grid">
        <TasksTimeRow selectedTime={time} onChange={updateTime} />
        <TasksCardsGrid
          time={time}
          query={query}
          data={data}
          updateQuery={updateQuery}
        />
      </Grid>
    );
  }
}

TasksDashboard.propTypes = {
  time: timePropType,
  query: queryPropType,
  data: TasksCardsGrid.propTypes.data,
  initializeDashboard: PropTypes.func,
  updateQuery: PropTypes.func,
  updateTime: PropTypes.func,
};

TasksDashboard.defaultProps = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
  data: TasksCardsGrid.defaultProps.data,
  initializeDashboard: () => null,
  updateQuery: () => null,
  updateTime: () => null,
};

export default TasksDashboard;

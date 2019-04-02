import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';

import TasksTimeRow from './Components/TasksTimeRow/TasksTimeRow';
import TasksCardsGrid from './Components/TasksCardsGrid/TasksCardsGrid';
import TasksLabelsRow from './Components/TasksLabelsRow/TasksLabelsRow';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from './TasksDashboardConstants';
import { getQueryFromUrl } from './TasksDashboardHelper';
import { timePropType, queryPropType } from './TasksDashboardPropTypes';
import './TasksDashboard.scss';

class TasksDashboard extends React.Component {
  componentDidMount() {
    const { time, initializeDashboard, fetchTasksSummary } = this.props;
    const query = getQueryFromUrl();

    initializeDashboard({
      time: query.time,
      query,
    });

    // dont fetch if time is going to be changed
    if (!query.time || query.time === time) {
      fetchTasksSummary(time);
    }
  }

  componentDidUpdate(prevProps) {
    const { time, fetchTasksSummary } = this.props;

    if (time !== prevProps.time) {
      fetchTasksSummary(time);
    }
  }

  render() {
    const { time, query, tasksSummary, updateTime, updateQuery } = this.props;

    return (
      <Grid fluid className="tasks-dashboard-grid">
        <TasksTimeRow time={time} updateTime={updateTime} />
        <TasksCardsGrid
          time={time}
          query={query}
          data={tasksSummary}
          updateQuery={updateQuery}
        />
        <TasksLabelsRow query={query} updateQuery={updateQuery} />
      </Grid>
    );
  }
}

TasksDashboard.propTypes = {
  time: timePropType,
  query: queryPropType,
  tasksSummary: TasksCardsGrid.propTypes.data,
  initializeDashboard: PropTypes.func,
  updateTime: PropTypes.func,
  updateQuery: PropTypes.func,
  fetchTasksSummary: PropTypes.func,
};

TasksDashboard.defaultProps = {
  time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  query: {},
  tasksSummary: TasksCardsGrid.defaultProps.data,
  initializeDashboard: () => null,
  updateTime: () => null,
  updateQuery: () => null,
  fetchTasksSummary: () => null,
};

export default TasksDashboard;

import React from 'react';
import PropTypes from 'prop-types';
import RunningTasksCard from './Components/RunningTasksCard/RunningTasksCard';
import PausedTasksCard from './Components/PausedTasksCard/PausedTasksCard';
import StoppedTasksCard from './Components/StoppedTasksCard/StoppedTasksCard';
import ScheduledTasksCard from './Components/ScheduledTasksCard/ScheduledTasksCard';
import {
  TASKS_SUMMARY_ZERO,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from './TasksDashboardConstants';

class TasksDashboard extends React.Component {
  componentDidMount() {
    this.props.getTasksSummary();
  }
  updateQuery = query => {
    const { state, time: timePeriod, result } = query;
    const data = [state, result, timePeriod || 'total'].filter(Boolean);
    this.props.updateQuery(data);
  };
  onTotalClickRunning = () =>
    this.updateQuery({ state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING });
  onTotalClickPaused = () =>
    this.updateQuery({ state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED });
  onLastClickRunning = () =>
    this.updateQuery({
      state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING,
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.LAST,
      time: this.props.timePeriod,
    });
  onOlderClickRunning = () =>
    this.updateQuery({
      state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING,
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.OLDER,
      time: this.props.timePeriod,
    });
  onLastClickPaused = () =>
    this.updateQuery({
      state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED,
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.LAST,
      time: this.props.timePeriod,
    });
  onOlderClickPaused = () =>
    this.updateQuery({
      state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED,
      mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.OLDER,
      time: this.props.timePeriod,
    });
  render() {
    const { timePeriod, tasksSummary } = this.props;
    return (
      <div className="tasks-dashboard">
        <RunningTasksCard
          time={timePeriod}
          onTotalClick={this.onTotalClickRunning}
          onLastClick={this.onLastClickRunning}
          onOlderClick={this.onOlderClickRunning}
          {...tasksSummary.running}
        />

        <PausedTasksCard
          time={timePeriod}
          onTotalClick={this.onTotalClickPaused}
          onLastClick={this.onLastClickPaused}
          onOlderClick={this.onOlderClickPaused}
          {...tasksSummary.paused}
        />

        <StoppedTasksCard time={timePeriod} data={tasksSummary.stopped} />

        <ScheduledTasksCard time={timePeriod} data={tasksSummary.scheduled} />
      </div>
    );
  }
}

TasksDashboard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  getTasksSummary: PropTypes.func,
  timePeriod: PropTypes.string,
  tasksSummary: PropTypes.shape({}),
  updateQuery: PropTypes.func,
};

TasksDashboard.defaultProps = {
  className: '',
  children: null,
  updateQuery: () => null,
  getTasksSummary: () => null,
  timePeriod: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
  tasksSummary: TASKS_SUMMARY_ZERO,
};

export default TasksDashboard;

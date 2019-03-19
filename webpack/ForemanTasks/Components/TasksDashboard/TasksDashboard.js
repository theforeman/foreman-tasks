import React from 'react';
import PropTypes from 'prop-types';
import RunningTasksCard from './Components/RunningTasksCard/RunningTasksCard';
import PausedTasksCard from './Components/PausedTasksCard/PausedTasksCard';
import StoppedTasksCard from './Components/StoppedTasksCard/StoppedTasksCard';
import ScheduledTasksCard from './Components/ScheduledTasksCard/ScheduledTasksCard';
import { buildObject } from './TasksDashboardHelper';

class TasksDashboard extends React.Component {
  state = {
    focusedOn: this.props.focusedOn,
  };
  updateQuery = query => {
    const { state, time: timePeriod, result } = query;
    const data = [state, result, timePeriod || 'total'].filter(Boolean);
    const focusedOn = buildObject(data);
    this.setState({
      focusedOn,
    });
  };
  onTotalClickRunning = () => this.updateQuery({ state: 'running' });
  onTotalClickPaused = () => this.updateQuery({ state: 'paused' });
  onLastClickRunning = () =>
    this.updateQuery({ state: 'running', time: 'last' });
  onOlderClickRunning = () =>
    this.updateQuery({ state: 'running', time: 'older' });
  onLastClickPaused = () => this.updateQuery({ state: 'paused', time: 'last' });
  onOlderClickPaused = () =>
    this.updateQuery({ state: 'paused', time: 'older' });

  getFunctions = data => {
    data.updateQuery = this.updateQuery;
    data.scheduled.onClick = () =>
      this.updateQuery({
        state: 'scheduled',
      });
    data.stopped.onTitleClick = () =>
      this.updateQuery({
        state: 'stopped',
      });
    for (const result of Object.keys(data.stopped)) {
      for (const time of Object.keys(data.stopped[result])) {
        data.stopped[result][time].onClick = () =>
          this.updateQuery({
            state: 'stopped',
            result,
            time,
          });
      }
    }
    return data;
  };
  getMockData = () => ({
    timePeriod: '24h',
    running: {
      last: 3,
      older: 5,
    },
    paused: {
      last: 3,
      older: 5,
    },
    stopped: {
      error: {
        total: {
          value: 8,
        },
        last: {
          value: 1,
        },
      },
      warning: {
        total: {
          value: 20,
        },
        last: {
          value: 2,
        },
      },
      success: {
        total: {
          value: 25,
        },
        last: {
          value: 3,
        },
      },
    },
    scheduled: {
      scheduled: 1,
    },
  });

  render() {
    const data = this.getFunctions(this.getMockData());
    const { timePeriod } = data;
    const { focusedOn } = this.state;
    return (
      <div className="tasks-dashboard">
        <RunningTasksCard
          timePeriod={timePeriod}
          focusedOn={focusedOn.running}
          onTotalClick={this.onTotalClickRunning}
          onLastClick={this.onLastClickRunning}
          onOlderClick={this.onOlderClickRunning}
          {...data.running}
        />

        <PausedTasksCard
          timePeriod={timePeriod}
          focusedOn={focusedOn.paused}
          onTotalClick={this.onTotalClickPaused}
          onLastClick={this.onLastClickPaused}
          onOlderClick={this.onOlderClickPaused}
          {...data.paused}
        />

        <StoppedTasksCard
          timePeriod={timePeriod}
          focusedOn={focusedOn.stopped}
          {...data.stopped}
        />

        <ScheduledTasksCard
          timePeriod={timePeriod}
          focusedOn={focusedOn.scheduled}
          {...data.scheduled}
        />
      </div>
    );
  }
}

TasksDashboard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  focusedOn: PropTypes.shape({
    running: PropTypes.shape({
      last: PropTypes.bool,
      older: PropTypes.bool,
      total: PropTypes.bool,
    }),
    paused: PropTypes.shape({
      last: PropTypes.bool,
      older: PropTypes.bool,
      total: PropTypes.bool,
    }),
    stopped: PropTypes.shape({
      normal: PropTypes.bool,
      error: PropTypes.shape({
        total: PropTypes.bool,
        last: PropTypes.bool,
      }),
      warning: PropTypes.shape({
        total: PropTypes.bool,
        last: PropTypes.bool,
      }),
      success: PropTypes.shape({
        total: PropTypes.bool,
        last: PropTypes.bool,
      }),
    }),
    scheduled: PropTypes.shape({
      scheduled: PropTypes.bool,
    }),
  }),
};

TasksDashboard.defaultProps = {
  className: '',
  children: null,
  focusedOn: {
    running: { normal: true },
    paused: { normal: true },
    stopped: { normal: true },
    scheduled: { normal: true },
  },
};

export default TasksDashboard;

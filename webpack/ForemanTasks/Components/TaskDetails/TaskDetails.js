import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import Task from './Components/Task';
import RunningSteps from './Components/RunningSteps';
import Errors from './Components/Errors';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import { getTaskID } from './TasksDetailsHelper';

import './TaskDetails.scss';

class TaskDetails extends Component {
  componentDidMount() {
    const { timeoutId, refetchTaskDetails, fetchTaskDetails } = this.props;

    fetchTaskDetails(getTaskID(), timeoutId, refetchTaskDetails);
  }
  componentWillUnmount() {
    this.props.taskReloadStop(this.props.timeoutId);
  }
  render() {
    const {
      externalId,
      startedAt,
      endedAt,
      label,
      input,
      output,
      executionPlan,
      failedSteps,
      runningSteps,
      locks,
    } = this.props;
    const id = getTaskID();
    const resumable = executionPlan ? executionPlan.state === 'paused' : false;
    const cancellable = executionPlan ? executionPlan.cancellable : false;
    return (
      <div className="task-details-react well">
        <Tabs defaultActiveKey={1} animation={false} id="task-details-tabs">
          <Tab eventKey={1} title={__('Task')}>
            <Task {...{ ...this.props, cancellable, resumable, id }} />
          </Tab>
          <Tab eventKey={2} title={__('Running Steps')}>
            <RunningSteps
              executionPlan={executionPlan}
              runningSteps={runningSteps}
            />
          </Tab>
          <Tab eventKey={3} title={__('Errors')}>
            <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
          </Tab>
          <Tab eventKey={4} title={__('Locks')}>
            <Locks locks={locks} />
          </Tab>
          <Tab eventKey={5} title={__('Raw')}>
            <Raw
              {...{ id, label, startedAt, endedAt, input, output, externalId }}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

TaskDetails.propTypes = {
  label: PropTypes.string,
  fetchTaskDetails: PropTypes.func,
  ...Task.propTypes,
  ...RunningSteps.propTypes,
  ...Errors.propTypes,
  ...Locks.propTypes,
  ...Raw.propTypes,
};
TaskDetails.defaultProps = {
  label: '',
  fetchTaskDetails: () => null,
  ...Task.defaultProps,
  ...RunningSteps.defaultProps,
  ...Errors.defaultProps,
  ...Locks.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

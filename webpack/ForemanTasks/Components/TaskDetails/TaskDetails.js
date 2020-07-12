import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import Task from './Components/Task';
import RunningSteps from './Components/RunningSteps';
import Errors from './Components/Errors';
import Locks from './Components/Locks';
import Raw from './Components/Raw';
import { getTaskID } from './TasksDetailsHelper';
import { TaskSkeleton } from './Components/TaskSkeleton';

import './TaskDetails.scss';

class TaskDetails extends Component {
  componentDidMount() {
    const { timeoutId, refetchTaskDetails, fetchTaskDetails } = this.props;
    fetchTaskDetails(getTaskID(), timeoutId, refetchTaskDetails);
  }
  componentWillUnmount() {
    this.props.taskReloadStop(this.props.timeoutId);
  }
  taskProgressToggle = () => {
    const {
      timeoutId,
      refetchTaskDetails,
      loading,
      taskReloadStop,
      taskReloadStart,
    } = this.props;
    const id = getTaskID();
    if (timeoutId) {
      taskReloadStop(timeoutId);
    } else {
      taskReloadStart(timeoutId, refetchTaskDetails, id, loading);
    }
  };
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
      cancelStep,
      status,
      isData,
      APIerror,
    } = this.props;
    const id = getTaskID();
    const resumable = executionPlan ? executionPlan.state === 'paused' : false;
    const cancellable = executionPlan ? executionPlan.cancellable : false;
    const loading = status === STATUS.PENDING && !isData;

    // const loading = true;
    if (status === STATUS.ERROR) {
      return (
        <MessageBox
          key="tasks-table-error"
          icontype="error-circle-o"
          msg={__(`Could not receive data: ${APIerror && APIerror.message}`)}
        />
      );
    }
    return (
      <div className="task-details-react well">
        <Tabs defaultActiveKey={1} animation={false} id="task-details-tabs">
          <Tab eventKey={1} title={__('Task')}>
            {loading ? (
              <TaskSkeleton />
            ) : (
              <Task
                {...{
                  ...this.props,
                  cancellable,
                  resumable,
                  id,
                  status,
                  taskProgressToggle: this.taskProgressToggle,
                }}
              />
            )}
          </Tab>
          <Tab eventKey={2} disabled={loading} title={__('Running Steps')}>
            <RunningSteps
              runningSteps={runningSteps}
              id={id}
              cancelStep={cancelStep}
              taskReload={this.props.taskReload}
              taskProgressToggle={this.taskProgressToggle}
            />
          </Tab>
          <Tab eventKey={3} disabled={loading} title={__('Errors')}>
            <Errors executionPlan={executionPlan} failedSteps={failedSteps} />
          </Tab>
          <Tab eventKey={4} disabled={loading} title={__('Locks')}>
            <Locks locks={locks} />
          </Tab>
          <Tab eventKey={5} disabled={loading} title={__('Raw')}>
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
  fetchTaskDetails: PropTypes.func.isRequired,
  runningSteps: PropTypes.array,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  APIerror: PropTypes.object,
  ...Task.propTypes,
  ...Errors.propTypes,
  ...Locks.propTypes,
  ...Raw.propTypes,
};
TaskDetails.defaultProps = {
  label: '',
  runningSteps: [],
  APIerror: null,
  status: STATUS.PENDING,
  ...Task.defaultProps,
  ...RunningSteps.defaultProps,
  ...Errors.defaultProps,
  ...Locks.defaultProps,
  ...Raw.defaultProps,
};

export default TaskDetails;

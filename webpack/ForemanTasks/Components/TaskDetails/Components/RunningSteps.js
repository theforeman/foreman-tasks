import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import API from 'foremanReact/API';

class RunningSteps extends Component {
  cancelStep = id => {
    API.POST(`/foreman_tasks/tasks/${id}/cancel_step`);
  };
  render() {
    const { runningSteps } = this.props;
    if (!runningSteps.length) return <span>{__('No running steps')}</span>;
    return (
      <div>
        {runningSteps.map((step, i) => (
          <Alert type="warning" key={i}>
            {step.cancellable && (
              <p>
                <Button
                  bsStyle="primary"
                  bsSize="Small"
                  onClick={this.cancelStep(step.id)}
                >
                  {__('Cancel')}
                </Button>
              </p>
            )}

            <p>
              <span>{__('Action')}:</span>
              <span />
            </p>
            <pre>{step.action_class}</pre>
            <p>
              <span>{__('State')}:</span>
              <span>{step.state}</span>
            </p>
            <span>{__('Input')}:</span>
            <span>
              <pre>{step.input}</pre>
            </span>
            <span>{__('Output')}:</span>
            <span>
              <pre>{step.output}</pre>
            </span>
          </Alert>
        ))}
      </div>
    );
  }
}

RunningSteps.propTypes = {
  runningSteps: PropTypes.array,
  executionPlan: PropTypes.shape({}),
};

RunningSteps.defaultProps = {
  runningSteps: [],
  executionPlan: {},
};

export default RunningSteps;

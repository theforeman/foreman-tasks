import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

const RunningSteps = ({
  runningSteps,
  id,
  cancelStep,
  taskReload,
  taskReloadStart,
}) => {
  if (!runningSteps.length) return <span>{__('No running steps')}</span>;
  return (
    <div>
      {runningSteps.map((step, i) => (
        <Alert type="warning" key={i}>
          {step.cancellable && (
            <p>
              <Button
                bsSize="small"
                onClick={() => {
                  if (!taskReload) {
                    taskReloadStart(id);
                  }
                  cancelStep(id, step.id);
                }}
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
};

RunningSteps.propTypes = {
  runningSteps: PropTypes.array,
  id: PropTypes.string.isRequired,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
};

RunningSteps.defaultProps = {
  runningSteps: [],
};

export default RunningSteps;

import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

const RunningSteps = ({ runningSteps }) => {
  if (!runningSteps.length) return <span>{__('No running steps')}</span>;
  return (
    <div>
      {runningSteps.map((step, i) => (
        <Alert type="warning" key={i}>
          {step.cancellable && (
            <p>
              <Button
                bsSize="small"
                data-method="post"
                href={`/foreman_tasks/tasks/${step.id}/cancel_step`}
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
};

RunningSteps.defaultProps = {
  runningSteps: [],
};

export default RunningSteps;

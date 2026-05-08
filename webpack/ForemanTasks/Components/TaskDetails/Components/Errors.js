import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';

const Errors = ({ ...props }) => {
  const { failedSteps, executionPlan } = props;
  if (!executionPlan)
    return (
      <Alert
        variant="danger"
        ouiaId="task-errors-plan-missing"
        title={__('Execution plan unavailable')}
      >
        {__('Execution plan data not available ')}
      </Alert>
    );
  if (!failedSteps.length)
    return (
      <Alert
        variant="success"
        isInline
        ouiaId="task-errors-none"
        title={__('No errors')}
      >
        {__('No errors')}
      </Alert>
    );
  return (
    <div>
      {failedSteps.map((step, i) => (
        <Alert
          variant="danger"
          key={i}
          ouiaId={`task-error-${i}`}
          title={__('Step error')}
        >
          <span>{__('Action')}:</span>
          <span>
            <pre>{step.action_class}</pre>
          </span>
          <span>{__('Input')}:</span>
          <span>
            <pre>{step.input}</pre>
          </span>
          <span>{__('Output')}:</span>
          <span>
            <pre>{step.output}</pre>
          </span>
          {step.error && (
            <React.Fragment>
              <span>{__('Exception')}:</span>
              <span>
                <pre>
                  {step.error.exception_class}: {step.error.message}
                </pre>
              </span>
              <span>{__('Backtrace')}:</span>
              <span>
                <pre>{(step.error.backtrace || []).join('\n')}</pre>
              </span>
            </React.Fragment>
          )}
        </Alert>
      ))}
    </div>
  );
};

Errors.propTypes = {
  failedSteps: PropTypes.array,
  executionPlan: PropTypes.shape({}),
};

Errors.defaultProps = {
  failedSteps: [],
  executionPlan: {},
};

export default Errors;

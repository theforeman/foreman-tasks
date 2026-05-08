import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertVariant, Button } from '@patternfly/react-core';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

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
      {runningSteps.map((step, i) => {
        const title =
          typeof step.title === 'string' && step.title.trim() !== ''
            ? step.title.trim()
            : sprintf(__('Running step %s'), i + 1);
        return (
          <Alert
            variant={AlertVariant.warning}
            isInline
            key={step.id || i}
            ouiaId={`running-step-${i}`}
            title={title}
          >
            {step.cancellable && (
              <p>
                <Button
                  variant="secondary"
                  size="sm"
                  ouiaId={`running-step-cancel-button-${i}`}
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
        );
      })}
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

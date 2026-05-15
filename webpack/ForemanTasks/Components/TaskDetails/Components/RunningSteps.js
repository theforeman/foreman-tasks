import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

const RunningStepDetailBlock = ({ label, children }) => (
  <GridItem span={12}>
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      <FlexItem>
        <strong>{label}</strong>
      </FlexItem>
      <FlexItem>{children}</FlexItem>
    </Flex>
  </GridItem>
);

RunningStepDetailBlock.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

const RunningSteps = ({
  runningSteps,
  id,
  cancelStep,
  taskReload,
  taskReloadStart,
}) => {
  if (!runningSteps.length) {
    return <span>{__('No running steps')}</span>;
  }

  return (
    <Stack hasGutter>
      {runningSteps.map((step, i) => (
        <StackItem key={step.id || i}>
          <Alert
            variant={AlertVariant.warning}
            isInline
            title={sprintf(__('Running step %s'), i + 1)}
            ouiaId={`running-step-${i}`}
          >
            <Grid hasGutter>
              {step.cancellable && (
                <GridItem span={12}>
                  <Flex>
                    <FlexItem>
                      <Button
                        ouiaId={`running-step-${i}-cancel`}
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (!taskReload) {
                            taskReloadStart(id);
                          }

                          cancelStep(id, step.id);
                        }}
                      >
                        {__('Cancel')}
                      </Button>
                    </FlexItem>
                  </Flex>
                </GridItem>
              )}
              <GridItem span={12}>
                <Flex
                  direction={{ default: 'row' }}
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsBaseline' }}
                >
                  <FlexItem>
                    <strong>{`${__('Action')}:`}</strong>
                  </FlexItem>
                  <FlexItem>{step.action_class}</FlexItem>
                </Flex>
              </GridItem>
              <GridItem span={12}>
                <Flex
                  direction={{ default: 'row' }}
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsBaseline' }}
                >
                  <FlexItem>
                    <strong>{`${__('State')}:`}</strong>
                  </FlexItem>
                  <FlexItem>{step.state}</FlexItem>
                </Flex>
              </GridItem>
              <RunningStepDetailBlock label={__('Input')}>
                <pre>{step.input}</pre>
              </RunningStepDetailBlock>
              <RunningStepDetailBlock label={__('Output')}>
                <pre>{step.output}</pre>
              </RunningStepDetailBlock>
            </Grid>
          </Alert>
        </StackItem>
      ))}
    </Stack>
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

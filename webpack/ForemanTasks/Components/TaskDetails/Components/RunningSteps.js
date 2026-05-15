import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HourglassStartIcon } from '@patternfly/react-icons';
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
  executionPlan,
  result,
  runningSteps,
  id,
  cancelStep,
  taskReload,
  taskReloadStart,
}) => {
  const planState = executionPlan?.state;
  const resultIsPending = String(result) === 'pending';

  if (!runningSteps.length) {
    if (planState === 'running' && resultIsPending) {
      return (
        <Alert
          variant={AlertVariant.warning}
          isInline
          ouiaId="running-steps-suspended-pending"
          title={__('Temporarily suspended step(s)')}
        >
          {__('The task is still being processed. Please wait.')}
        </Alert>
      );
    }

    if (planState === 'planned' && resultIsPending) {
      return (
        <Grid>
          <GridItem span={12}>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentCenter' }}
              fullWidth={{ default: 'fullWidth' }}
            >
              <FlexItem>
                <EmptyState variant={EmptyStateVariant.full}>
                  <EmptyStateHeader
                    titleText={__('Planned task')}
                    headingLevel="h2"
                    icon={<EmptyStateIcon icon={HourglassStartIcon} />}
                  />
                  <EmptyStateBody>
                    {__('The task has not started yet.')}
                  </EmptyStateBody>
                </EmptyState>
              </FlexItem>
            </Flex>
          </GridItem>
        </Grid>
      );
    }

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
  executionPlan: PropTypes.shape({ state: PropTypes.string }),
  result: PropTypes.string,
  runningSteps: PropTypes.array,
  id: PropTypes.string.isRequired,
  cancelStep: PropTypes.func.isRequired,
  taskReload: PropTypes.bool.isRequired,
  taskReloadStart: PropTypes.func.isRequired,
};

RunningSteps.defaultProps = {
  runningSteps: [],
  executionPlan: {},
  result: undefined,
};

export default RunningSteps;

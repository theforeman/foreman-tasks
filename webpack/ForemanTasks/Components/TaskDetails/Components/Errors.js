import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
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
import { CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

const ErrorDetailBlock = ({ label, children }) => (
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

ErrorDetailBlock.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ErrorDetailBlock.defaultProps = {
  label: [],
};

const Errors = ({ executionPlan, failedSteps }) => {
  if (!executionPlan) {
    return (
      <Alert variant={AlertVariant.danger} ouiaId="task-errors-plan-missing">
        {__('Execution plan data not available ')}
      </Alert>
    );
  }

  if (!failedSteps.length) {
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
                  titleText={__('No errors found')}
                  headingLevel="h2"
                  icon={
                    <EmptyStateIcon
                      icon={CheckCircleIcon}
                      color={globalSuccessColor100.value}
                    />
                  }
                />
                <EmptyStateBody>
                  {__('The task finished with no errors or warnings.')}
                </EmptyStateBody>
              </EmptyState>
            </FlexItem>
          </Flex>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Stack hasGutter>
      {failedSteps.map((step, i) => {
        const summary =
          step.error?.message || step.action_class || __('Unknown error');
        const isStoppedStep = ['skipped', 'skipping'].includes(
          String(step.state ?? '')
        );
        const variant = isStoppedStep
          ? AlertVariant.warning
          : AlertVariant.danger;
        const titleKey = isStoppedStep
          ? __('Stopped task: %s')
          : __('Failed task: %s');

        return (
          <StackItem key={`${step.action_class}-${i}`}>
            <Alert
              variant={variant}
              isInline
              isExpandable
              ouiaId={`task-error-${i}`}
              title={sprintf(titleKey, summary)}
              toggleAriaLabel={
                isStoppedStep
                  ? __('Toggle stopped task details')
                  : __('Toggle error details')
              }
            >
              <Grid hasGutter>
                <ErrorDetailBlock label={__('Action')}>
                  <pre>{step.action_class}</pre>
                </ErrorDetailBlock>
                <ErrorDetailBlock label={__('Input')}>
                  <pre>{step.input}</pre>
                </ErrorDetailBlock>
                <ErrorDetailBlock label={__('Output')}>
                  <pre>{step.output}</pre>
                </ErrorDetailBlock>
                {step.error && (
                  <>
                    <ErrorDetailBlock label={`${__('Exception')}:`}>
                      <pre>
                        {step.error.exception_class}: {step.error.message}
                      </pre>
                    </ErrorDetailBlock>
                    <ErrorDetailBlock label={__('Backtrace')}>
                      <pre>{(step.error.backtrace || []).join('\n')}</pre>
                    </ErrorDetailBlock>
                  </>
                )}
              </Grid>
            </Alert>
          </StackItem>
        );
      })}
    </Stack>
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

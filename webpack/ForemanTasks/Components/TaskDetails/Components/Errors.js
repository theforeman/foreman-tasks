import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  CodeBlock,
  CodeBlockCode,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  Icon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { translate as __, sprintf } from 'foremanReact/common/I18n';

const TRANSPARENT_CODE_BLOCK_STYLE = {
  '--pf-v5-c-code-block--BackgroundColor': 'transparent',
  backgroundColor: 'transparent',
};

const ErrorDetailSection = ({ label, children }) => (
  <StackItem>
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      <FlexItem>
        <strong>{label}</strong>
      </FlexItem>
      <FlexItem>
        <CodeBlock style={TRANSPARENT_CODE_BLOCK_STYLE}>
          <CodeBlockCode>{children}</CodeBlockCode>
        </CodeBlock>
      </FlexItem>
    </Flex>
  </StackItem>
);

ErrorDetailSection.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

const ErrorDetailsPane = ({ step }) => {
  if (!step) {
    return null;
  }

  return (
    <Stack hasGutter>
      <ErrorDetailSection label={__('Input')}>{step.input}</ErrorDetailSection>
      <ErrorDetailSection label={__('Output')}>
        {step.output}
      </ErrorDetailSection>
      {step.error && (
        <>
          <ErrorDetailSection label={`${__('Exception')}:`}>
            {step.error.exception_class}: {step.error.message}
          </ErrorDetailSection>
          <ErrorDetailSection label={__('Backtrace')}>
            {(step.error.backtrace || []).join('\n')}
          </ErrorDetailSection>
        </>
      )}
    </Stack>
  );
};

ErrorDetailsPane.propTypes = {
  step: PropTypes.shape({
    input: PropTypes.node,
    output: PropTypes.node,
    error: PropTypes.shape({
      exception_class: PropTypes.string,
      message: PropTypes.string,
      backtrace: PropTypes.array,
    }),
  }),
};

ErrorDetailsPane.defaultProps = {
  step: null,
};

const Errors = ({ executionPlan, failedSteps }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(idx => {
      if (idx >= failedSteps.length) {
        return Math.max(0, failedSteps.length - 1);
      }

      return idx;
    });
  }, [failedSteps.length]);

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
                    <Icon size="xl" status="success">
                      <CheckCircleIcon />
                    </Icon>
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

  const selectedStep = failedSteps[selectedIndex];

  return (
    <Split hasGutter>
      <SplitItem style={{ flex: '0 0 min(33%, 20rem)', minWidth: 0 }}>
        <Flex
          direction={{ default: 'column' }}
          fullWidth={{ default: 'fullWidth' }}
          role="listbox"
          aria-label={__('Failed task errors')}
          style={{ minWidth: 0 }}
        >
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
              const selected = i === selectedIndex;

              return (
                <StackItem key={`${step.action_class}-${i}`}>
                  <Flex
                    direction={{ default: 'column' }}
                    fullWidth={{ default: 'fullWidth' }}
                    role="option"
                    aria-selected={selected}
                    tabIndex={0}
                    onClick={() => setSelectedIndex(i)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedIndex(i);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <Alert
                      variant={variant}
                      isInline
                      ouiaId={`task-error-${i}`}
                      title={sprintf(titleKey, summary)}
                    />
                  </Flex>
                </StackItem>
              );
            })}
          </Stack>
        </Flex>
      </SplitItem>
      <SplitItem isFilled style={{ minWidth: 0 }}>
        <ErrorDetailsPane step={selectedStep} />
      </SplitItem>
    </Split>
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

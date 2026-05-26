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

const SPACER_MD = '1rem';
const SPACER_LG = '1.5rem';
const SPACER_XS = '0.25rem';

const ERROR_DETAIL_WRAPPER_STYLE = {
  marginTop: SPACER_MD,
  marginLeft: SPACER_LG,
};

const ERROR_DETAIL_LABEL_STYLE = {
  paddingBottom: SPACER_XS,
};

const ERROR_DETAIL_SPLIT_ITEM_STYLE = {
  flex: '0 0 min(33%, 20rem)',
  minWidth: 0,
  marginTop: SPACER_MD,
  borderRight: '1px solid #000000B0',
};

const STEP_ALERT_STYLE = {
  boxShadow: 'none',
  border: '1px solid #8a8d90',
};

const TASK_ERRORS_CODEBLOCK_STYLE = {
  backgroundColor: 'transparent',
};

const TASK_ERRORS_CODEBLOCK_CODE_STYLE = {
  margin: `-${SPACER_MD}`,
  backgroundColor: 'transparent',
};

const ErrorDetailSection = ({ label, children }) => (
  <StackItem style={ERROR_DETAIL_WRAPPER_STYLE}>
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      <FlexItem style={ERROR_DETAIL_LABEL_STYLE}>
        <strong>{label}</strong>
      </FlexItem>
      <FlexItem>
        <CodeBlock style={TASK_ERRORS_CODEBLOCK_STYLE}>
          <CodeBlockCode style={TASK_ERRORS_CODEBLOCK_CODE_STYLE}>
            {children}
          </CodeBlockCode>
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
    <Stack>
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
      <SplitItem style={ERROR_DETAIL_SPLIT_ITEM_STYLE}>
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
                    tabIndex={i}
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
                      ouiaId={`task-error-${i}`}
                      style={STEP_ALERT_STYLE}
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

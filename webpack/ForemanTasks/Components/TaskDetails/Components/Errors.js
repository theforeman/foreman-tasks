import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';

import './Errors.scss';

const isStoppedStep = step =>
  ['skipped', 'skipping'].includes(String(step.state ?? ''));

const getStepSummary = step =>
  step.error?.message || step.action_class || __('Unknown error');

const getStepStatus = step => (isStoppedStep(step) ? 'warning' : 'danger');

const ErrorTabTitle = ({ step }) => {
  const status = getStepStatus(step);

  return (
    <>
      <TabTitleIcon>
        <Icon status={status}>
          <ExclamationCircleIcon />
        </Icon>
      </TabTitleIcon>{' '}
      <TabTitleText
        className={classNames(
          'task-errors-tab-title',
          `task-errors-tab-title--${status}`
        )}
      >
        {getStepSummary(step)}
      </TabTitleText>{' '}
    </>
  );
};

ErrorTabTitle.propTypes = {
  step: PropTypes.shape({
    action_class: PropTypes.string,
    state: PropTypes.string,
    error: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
};

const ErrorDetailSection = ({ label, children }) => (
  <StackItem className="task-errors-detail-section">
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
    >
      <FlexItem className="task-errors-detail-label">
        <strong>{label}</strong>
      </FlexItem>
      <FlexItem>
        <CodeBlock className="task-errors-codeblock">
          <CodeBlockCode className="task-errors-codeblock-code">
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
      <ErrorDetailSection label={__('Input')}>{step.input}</ErrorDetailSection>
      <ErrorDetailSection label={__('Output')}>
        {step.output}
      </ErrorDetailSection>
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
      <Alert
        title={__('Execution plan data not available ')}
        variant={AlertVariant.danger}
        ouiaId="task-errors-plan-missing"
      />
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
      <SplitItem className="task-errors-tabs-split">
        <Tabs
          id="task-errors-tabs"
          ouiaId="task-errors-tabs"
          activeKey={selectedIndex}
          className="task-errors-tabs"
          onSelect={(_event, tabIndex) => setSelectedIndex(Number(tabIndex))}
          isVertical
          isBox
          aria-label={__('Failed task errors')}
        >
          {failedSteps.map((step, i) => (
            <Tab
              key={`${step.action_class}-${i}`}
              eventKey={i}
              ouiaId={`task-error-${i}`}
              title={<ErrorTabTitle step={step} />}
              aria-label={getStepSummary(step)}
            />
          ))}
        </Tabs>
      </SplitItem>
      <SplitItem isFilled>
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

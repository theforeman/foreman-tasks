import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ExecutionDetails from '../ExecutionDetails';
import {
  fixtureFailedExecutionDetail,
  fixtureRunningExecutionDetail,
} from './TaskDetails.fixtures';

const rtlBaseProps = {
  cancelStep: jest.fn(),
  taskReloadStart: jest.fn(),
  id: 'a15dd820-32f1-4ced-9ab7-c0fab8234c47',
  taskReload: false,
};

describe('ExecutionDetails', () => {
  it('renders execution details panel with OUIA id', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="stopped"
        runningSteps={[]}
        executionPlan={{ state: 'stopped', cancellable: false }}
        failedSteps={[]}
      />
    );

    expect(
      document.querySelector('[data-ouia-component-id="execution-details-panel"]')
    ).toBeInTheDocument();
    expect(document.getElementById('execution-details-panel')).toBeInTheDocument();
  });

  it('shows Errors pane when stopped with no running steps', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="stopped"
        runningSteps={[]}
        executionPlan={{ state: 'stopped', cancellable: false }}
        failedSteps={[]}
      />
    );

    expect(screen.getByRole('heading', { name: /^no errors found$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/the task finished with no errors or warnings/i)
    ).toBeInTheDocument();
  });

  it('shows RunningSteps when stopped but runningSteps list is non-empty', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="stopped"
        runningSteps={[
          {
            cancellable: false,
            id: 1,
            action_class: 'Actions::Stale',
            state: 'paused',
            input: '{}',
            output: '{}',
          },
        ]}
        executionPlan={{ state: 'stopped', cancellable: false }}
        failedSteps={[]}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Warning alert: Running step 1' })
    ).toBeInTheDocument();
  });

  it('forwards executionPlan and result to RunningSteps when state is pending without steps', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="pending"
        runningSteps={[]}
        executionPlan={{ state: 'planned', cancellable: false }}
        result="pending"
        failedSteps={[]}
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /planned task/i })
    ).toBeInTheDocument();
  });

  it('shows temporarily suspended messaging when pending, plan running, result pending', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="pending"
        runningSteps={[]}
        executionPlan={{ state: 'running', cancellable: false }}
        result="pending"
        failedSteps={[]}
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: /temporarily suspended step/i,
      })
    ).toBeInTheDocument();
  });

  it('routes failed steps through Errors pane when stopped', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        {...fixtureFailedExecutionDetail}
        executionPlan={fixtureFailedExecutionDetail.executionPlan}
        failedSteps={fixtureFailedExecutionDetail.failedSteps}
      />
    );

    expect(
      screen.getByRole('tab', {
        name: /action actions::katello::eventqueue::monitor is already active/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/failed task errors/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Exception:')).toBeInTheDocument();
  });

  it('renders RunningSteps with cancel when task is running', () => {
    const cancelStep = jest.fn();

    render(
      <ExecutionDetails
        {...rtlBaseProps}
        cancelStep={cancelStep}
        {...fixtureRunningExecutionDetail}
        runningSteps={[
          {
            ...fixtureRunningExecutionDetail.runningSteps[0],
            cancellable: true,
          },
        ]}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows RunningSteps when state is paused without running steps', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="paused"
        runningSteps={[]}
        executionPlan={{ state: 'paused', cancellable: false }}
        failedSteps={[]}
      />
    );

    expect(screen.getByText(/no running steps/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /^no errors found$/i })
    ).not.toBeInTheDocument();
  });

  it('shows RunningSteps when state is paused with running steps', () => {
    render(
      <ExecutionDetails
        {...rtlBaseProps}
        state="paused"
        runningSteps={[
          {
            ...fixtureRunningExecutionDetail.runningSteps[0],
            state: 'paused',
          },
        ]}
        executionPlan={{ state: 'paused', cancellable: false }}
        failedSteps={[]}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Warning alert: Running step 1' })
    ).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
  });
});

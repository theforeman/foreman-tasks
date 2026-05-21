import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Errors from '../Errors';

const failedStepFixture = {
  error: {
    exception_class: 'RuntimeError',
    message: 'Action Actions::Katello::EventQueue::Monitor is already active',
    backtrace: [
      "/home/vagrant/.gem/ruby/gems/dynflow-1.2.3/lib/dynflow/action/singleton.rb:15:in `rescue in singleton_lock!'",
      "/home/vagrant/.gem/ruby/gems/dynflow-1.2.3/lib/dynflow/action/singleton.rb:12:in `singleton_lock!'",
    ],
  },
  action_class: 'Actions::Katello::EventQueue::Monitor',
  state: 'error',
  input:
    '{"locale"=>"en",\n "current_request_id"=>nil,\n "current_user_id"=>4,\n "current_organization_id"=>nil,\n "current_location_id"=>nil}\n',
  output: '{}\n',
};

const executionPlan = { state: 'paused', cancellable: false };

describe('Errors', () => {
  it('renders warning when execution plan is missing', () => {
    render(<Errors failedSteps={[]} executionPlan={null} />);
    expect(
      screen.getByText(/execution plan data not available/i)
    ).toBeInTheDocument();
  });

  it('renders success state when there are no failed steps', () => {
    render(<Errors failedSteps={[]} executionPlan={{ state: 'paused' }} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /no errors found/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the task finished with no errors or warnings/i)
    ).toBeInTheDocument();
  });

  it('renders failed step details when failedSteps is non-empty', () => {
    const { container } = render(
      <Errors
        executionPlan={executionPlan}
        failedSteps={[failedStepFixture]}
      />
    );
    const stepAlert = container.querySelector(
      '[data-ouia-component-id="task-error-0"]'
    );
    expect(stepAlert).toBeInTheDocument();
    expect(stepAlert).toHaveClass('pf-m-inline');
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: /failed task: action actions::katello::eventqueue::monitor is already active/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listbox', { name: /failed task errors/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText('Exception:')).toBeInTheDocument();
    expect(screen.getByText('Backtrace')).toBeInTheDocument();
    expect(screen.getByText(/runtimeerror/i)).toBeInTheDocument();
    expect(screen.getByText(/singleton_lock/i)).toBeInTheDocument();
  });

  it('switches detail pane when a different error option is clicked', () => {
    const firstStep = {
      ...failedStepFixture,
      action_class: 'Action::First',
      input: 'INPUT_FROM_FIRST_STEP',
      output: '{}',
    };
    const secondStep = {
      ...failedStepFixture,
      action_class: 'Action::Second',
      error: {
        exception_class: 'StandardError',
        message: 'second step failure',
        backtrace: [],
      },
      input: 'INPUT_FROM_SECOND_STEP',
      output: 'OUTPUT_SECOND',
      state: 'error',
    };

    render(
      <Errors
        executionPlan={executionPlan}
        failedSteps={[firstStep, secondStep]}
      />
    );

    expect(screen.getByText('INPUT_FROM_FIRST_STEP')).toBeInTheDocument();
    expect(screen.queryByText('INPUT_FROM_SECOND_STEP')).not.toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(options[1]);

    expect(screen.getByText('INPUT_FROM_SECOND_STEP')).toBeInTheDocument();
    expect(screen.queryByText('INPUT_FROM_FIRST_STEP')).not.toBeInTheDocument();
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('OUTPUT_SECOND')).toBeInTheDocument();
  });

  it('selects an error option with Enter', () => {
    const firstStep = {
      ...failedStepFixture,
      action_class: 'Action::First',
      input: 'ONLY_FIRST',
      output: '{}',
    };
    const secondStep = {
      ...failedStepFixture,
      action_class: 'Action::Second',
      error: {
        ...failedStepFixture.error,
        message: 'other',
      },
      input: 'ONLY_SECOND',
      output: '{}',
      state: 'error',
    };

    render(
      <Errors
        executionPlan={executionPlan}
        failedSteps={[firstStep, secondStep]}
      />
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[1], { key: 'Enter', preventDefault: jest.fn() });

    expect(screen.getByText('ONLY_SECOND')).toBeInTheDocument();
    expect(screen.queryByText('ONLY_FIRST')).not.toBeInTheDocument();
  });

  it('selects an error option with Space', () => {
    const firstStep = {
      ...failedStepFixture,
      action_class: 'Action::A',
      input: 'INPUT_A_UNIQUE',
      output: '{}',
    };
    const secondStep = {
      ...failedStepFixture,
      action_class: 'Action::B',
      input: 'INPUT_B_UNIQUE',
      output: '{}',
      state: 'error',
    };

    render(
      <Errors
        executionPlan={executionPlan}
        failedSteps={[firstStep, secondStep]}
      />
    );

    fireEvent.keyDown(screen.getAllByRole('option')[1], {
      key: ' ',
      preventDefault: jest.fn(),
    });

    expect(screen.getByText('INPUT_B_UNIQUE')).toBeInTheDocument();
  });

  it('clamps selection when failedSteps shrinks', () => {
    const firstStep = {
      ...failedStepFixture,
      action_class: 'Action::First',
      input: 'AFTER_CLAMP',
      output: '{}',
    };
    const secondStep = {
      ...failedStepFixture,
      action_class: 'Action::Second',
      input: 'REMOVED',
      output: '{}',
      state: 'error',
    };

    const { rerender } = render(
      <Errors
        executionPlan={executionPlan}
        failedSteps={[firstStep, secondStep]}
      />
    );

    fireEvent.click(screen.getAllByRole('option')[1]);
    expect(screen.getByText('REMOVED')).toBeInTheDocument();

    rerender(
      <Errors executionPlan={executionPlan} failedSteps={[firstStep]} />
    );

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('AFTER_CLAMP')).toBeInTheDocument();
  });

  it('uses stopped task title and warning for skipped steps', () => {
    const skippedStep = {
      action_class: 'Actions::Example',
      state: 'skipped',
      input: '{}',
      output: '{}',
    };

    const { container } = render(
      <Errors executionPlan={executionPlan} failedSteps={[skippedStep]} />
    );

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: /stopped task: actions::example/i,
      })
    ).toBeInTheDocument();

    const alert = container.querySelector('[data-ouia-component-id="task-error-0"]');
    expect(alert).toHaveClass('pf-m-warning');
  });

  it('omits exception and backtrace when step has no error object', () => {
    const stepWithoutError = {
      action_class: 'Actions::NoError',
      state: 'error',
      input: 'plain-input',
      output: 'plain-output',
    };

    render(
      <Errors executionPlan={executionPlan} failedSteps={[stepWithoutError]} />
    );

    expect(screen.getByText('plain-input')).toBeInTheDocument();
    expect(screen.getByText('plain-output')).toBeInTheDocument();
    expect(screen.queryByText('Exception:')).not.toBeInTheDocument();
    expect(screen.queryByText('Backtrace')).not.toBeInTheDocument();
  });
});

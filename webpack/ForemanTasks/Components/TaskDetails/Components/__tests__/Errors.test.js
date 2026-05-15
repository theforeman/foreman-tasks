import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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
        executionPlan={{ state: 'paused', cancellable: false }}
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
    fireEvent.click(
      screen.getByRole('button', { name: /toggle error details/i })
    );
    const inAlert = within(stepAlert);
    expect(
      inAlert.getByText('Actions::Katello::EventQueue::Monitor')
    ).toBeInTheDocument();
    expect(inAlert.getByText(/runtimeerror/i)).toBeInTheDocument();
    expect(inAlert.getByText(/singleton_lock/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Errors from '../Errors';

const failedStepFixture = {
  error: {
    exception_class: 'RuntimeError',
    message:
      'Action Actions::Katello::EventQueue::Monitor is already active',
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
    render(
      <Errors failedSteps={[]} executionPlan={{ state: 'paused' }} />
    );
    expect(screen.getByText(/^no errors$/i)).toBeInTheDocument();
  });

  it('renders failed step details when failedSteps is non-empty', () => {
    render(
      <Errors
        executionPlan={{ state: 'paused', cancellable: false }}
        failedSteps={[failedStepFixture]}
      />
    );
    expect(
      screen.getByText('Actions::Katello::EventQueue::Monitor')
    ).toBeInTheDocument();
    expect(screen.getByText(/runtimeerror/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /action actions::katello::eventqueue::monitor is already active/i
      )
    ).toBeInTheDocument();
  });
});

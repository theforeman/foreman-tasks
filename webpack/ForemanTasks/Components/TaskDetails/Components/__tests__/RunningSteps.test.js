import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import RunningSteps from '../RunningSteps';

const baseProps = {
  id: 'task-id1',
  taskReload: true,
  cancelStep: jest.fn(),
  taskReloadStart: jest.fn(),
};

const sampleStep = {
  cancellable: false,
  id: 1,
  action_class: 'test',
  state: 'paused',
  input:
    '{"locale"=>"en",\n "current_request_id"=>nil,\n "current_user_id"=>4,\n "current_organization_id"=>nil,\n "current_location_id"=>nil}\n',
  output: '{}\n',
};

describe('RunningSteps', () => {
  it('renders empty message when there are no running steps', () => {
    render(<RunningSteps {...baseProps} runningSteps={[]} />);
    expect(screen.getByText(/no running steps/i)).toBeInTheDocument();
  });

  it('shows suspended warning when plan is running, result pending, no steps', () => {
    render(
      <RunningSteps
        {...baseProps}
        runningSteps={[]}
        executionPlan={{ state: 'running', cancellable: false }}
        result="pending"
      />
    );

    expect(
      screen.getByRole('heading', {
        level: 4,
        name: /temporarily suspended step/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the task is still being processed/i)
    ).toBeInTheDocument();
  });

  it('shows planned empty state when plan is planned, result pending, no steps', () => {
    render(
      <RunningSteps
        {...baseProps}
        runningSteps={[]}
        executionPlan={{ state: 'planned', cancellable: false }}
        result="pending"
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /planned task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the task has not started yet/i)
    ).toBeInTheDocument();
  });

  it('renders running step fields and Cancel when step is cancellable', () => {
    const cancelStep = jest.fn();
    render(
      <RunningSteps
        {...baseProps}
        cancelStep={cancelStep}
        runningSteps={[
          {
            ...sampleStep,
            cancellable: true,
            id: 99,
          },
        ]}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Warning alert: Running step 1' })
    ).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(cancelStep).toHaveBeenCalledWith('task-id1', 99);
  });

  it('uses sprintf so each running step title shows a 1-based step index', () => {
    render(
      <RunningSteps
        {...baseProps}
        runningSteps={[sampleStep, { ...sampleStep, id: 2, state: 'running' }]}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Warning alert: Running step 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Warning alert: Running step 2' })
    ).toBeInTheDocument();
  });
});

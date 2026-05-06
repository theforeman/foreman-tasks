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
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(cancelStep).toHaveBeenCalledWith('task-id1', 99);
  });
});

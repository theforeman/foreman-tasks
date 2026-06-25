import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskDetailsHeader from '../TaskDetailsHeader';

const baseHeaderProps = {
  id: 'test-id',
  action: 'Refresh hosts',
  state: 'running',
  result: 'pending',
  taskReload: false,
  taskReloadStart: jest.fn(),
  taskReloadStop: jest.fn(),
  forceCancelTaskRequest: jest.fn(),
  unlockTaskRequest: jest.fn(),
  cancelTaskRequest: jest.fn(),
  resumeTaskRequest: jest.fn(),
  canEdit: true,
  dynflowEnableConsole: true,
  externalId: 'ext-99',
  executionPlan: {},
};

describe('TaskDetailsHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders action heading and exposes cancel, dynflow link, and task actions toggle', () => {
    render(<TaskDetailsHeader {...baseHeaderProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Refresh hosts' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /dynflow console/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^task actions$/i })
    ).toBeInTheDocument();
  });

  it('shows running status icon next to the title when task state is running', () => {
    render(
      <TaskDetailsHeader
        {...baseHeaderProps}
        action="Running job"
        state="running"
        result="pending"
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Running job' })
    ).toBeInTheDocument();
    expect(screen.getByTitle('Running')).toBeInTheDocument();
  });

  it('shows error status icon next to the title when task stopped with error', () => {
    render(
      <TaskDetailsHeader
        {...baseHeaderProps}
        action="Failed job"
        state="stopped"
        result="error"
      />
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Failed job' })
    ).toBeInTheDocument();
    expect(screen.getByTitle('Error')).toBeInTheDocument();
  });

  it('uses generic title when action is unset', () => {
    render(<TaskDetailsHeader {...baseHeaderProps} action="" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Task Details' })
    ).toBeInTheDocument();
  });
});

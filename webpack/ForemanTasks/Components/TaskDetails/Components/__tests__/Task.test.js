import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Task from '../Task';

jest.mock('foremanReact/components/common/dates/RelativeDateTime', () => {
  const RelativeDateTime = ({ date, defaultValue }) => (
    <span>{date || defaultValue}</span>
  );
  return RelativeDateTime;
});

jest.mock('../TaskInfo', () => {
  const TaskInfo = () => null;

  return TaskInfo;
});

const baseTaskProps = {
  id: 'test',
  taskReloadStart: jest.fn(),
  taskProgressToggle: jest.fn(),
  cancelTaskRequest: jest.fn(),
  resumeTaskRequest: jest.fn(),
};

describe('Task', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders action heading and exposes cancel, dynflow link, and task actions toggle', () => {
    render(
      <Task
        {...baseTaskProps}
        action="Refresh hosts"
        dynflowEnableConsole
        externalId="ext-99"
      />
    );

    expect(
      screen.getByRole('heading', { level: 4, name: 'Refresh hosts' })
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
      <Task
        {...baseTaskProps}
        action="Running job"
        state="running"
        result="pending"
      />
    );

    expect(
      screen.getByRole('heading', { level: 4, name: 'Running job' })
    ).toBeInTheDocument();
    expect(screen.getByTitle('Running')).toBeInTheDocument();
  });
});

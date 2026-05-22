import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { STATUS } from 'foremanReact/constants';

import Task from '../Task';

jest.mock('foremanReact/components/common/dates/RelativeDateTime', () => {
  const RelativeDateTime = ({ date, defaultValue }) => (
    <span>{date || defaultValue}</span>
  );
  return RelativeDateTime;
});

const baseTaskProps = {
  id: 'test',
  taskReloadStart: jest.fn(),
  taskProgressToggle: jest.fn(),
  cancelTaskRequest: jest.fn(),
  resumeTaskRequest: jest.fn(),
};

const openTaskActionsMenu = async () => {
  fireEvent.click(screen.getByRole('button', { name: /^task actions$/i }));

  await waitFor(() => {
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
};

describe('Task', () => {
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

  it('puts reload controls in the overflow menu instead of standalone buttons', async () => {
    render(<Task {...baseTaskProps} action="X" />);
    expect(
      screen.queryByRole('button', { name: /start auto-reloading/i })
    ).not.toBeInTheDocument();

    await openTaskActionsMenu();
    expect(
      screen.getByRole('menuitem', { name: /start auto-reloading/i })
    ).toBeInTheDocument();
  });

  it('navigates parent and subtask targets from overflow items', async () => {
    const assign = jest.fn();
    delete window.location;
    window.location = { ...window.location, assign };

    render(
      <Task
        {...baseTaskProps}
        action="Nested"
        hasSubTasks
        parentTask="parent-id"
        taskReload
        canEdit
        status={STATUS.RESOLVED}
        dynflowEnableConsole
        externalId="e-out"
      />
    );

    await openTaskActionsMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: /parent task/i }));
    expect(assign).toHaveBeenCalledWith('/foreman_tasks/tasks/parent-id');

    fireEvent.click(screen.getByRole('button', { name: /^task actions$/i }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('menuitem', { name: /sub tasks/i }));
    expect(assign).toHaveBeenCalledWith('/foreman_tasks/tasks/test/sub_tasks');
  });

  it('shows an icon next to the title when task state is running', () => {
    render(
      <Task
        {...baseTaskProps}
        action="Running job"
        state="running"
        result="pending"
      />
    );

    const heading = screen.getByRole('heading', { level: 4 });
    expect(
      heading.parentElement?.nextElementSibling?.querySelector('svg')
    ).toBeTruthy();
  });
});

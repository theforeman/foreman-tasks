import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { STATUS } from 'foremanReact/constants';

import Task from '../Task';

describe('Task', () => {
  it('renders task controls from TaskButtons with minimal props', () => {
    render(
      <Task
        id="test"
        taskReloadStart={jest.fn()}
        taskProgressToggle={jest.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: /start auto-reloading/i })
    ).toBeInTheDocument();
  });

  it('renders parent task and sub tasks links when provided', () => {
    render(
      <Task
        id="test"
        state="paused"
        hasSubTasks
        dynflowEnableConsole
        parentTask="parent-id"
        taskReload
        canEdit
        status={STATUS.RESOLVED}
        taskProgressToggle={jest.fn()}
        taskReloadStart={jest.fn()}
      />
    );
    expect(screen.getByRole('link', { name: /parent task/i })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/parent-id'
    );
    expect(screen.getByRole('link', { name: /sub tasks/i })).toHaveAttribute(
      'href',
      '/foreman_tasks/tasks/test/sub_tasks'
    );
  });
});

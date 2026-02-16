import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { STATUS } from 'foremanReact/constants';
import { TaskButtons } from '../TaskButtons';

const setUnlockModalOpen = jest.fn();
const setForceUnlockModalOpen = jest.fn();

const defaultProps = {
  id: 'test',
  taskReloadStart: jest.fn(),
  taskProgressToggle: jest.fn(),
  cancelTaskRequest: jest.fn(),
  resumeTaskRequest: jest.fn(),
  setUnlockModalOpen,
  setForceUnlockModalOpen,
};

describe('TaskButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders reload button with correct text when taskReload is false', () => {
      render(<TaskButtons {...defaultProps} taskReload={false} />);
      expect(
        screen.getByRole('button', { name: /start auto-reloading/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /stop auto-reloading/i })
      ).not.toBeInTheDocument();
    });

    it('renders reload button with correct text when taskReload is true', () => {
      render(<TaskButtons {...defaultProps} taskReload />);
      expect(
        screen.getByRole('button', { name: /stop auto-reloading/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /start auto-reloading/i })
      ).not.toBeInTheDocument();
    });

    it('renders dynflow console link with correct href when externalId is provided', () => {
      render(<TaskButtons {...defaultProps} externalId="external-123" />);
      const dynflowLink = screen.getByRole('link', {
        name: /dynflow console/i,
      });
      expect(dynflowLink).toHaveAttribute(
        'href',
        '/foreman_tasks/dynflow/external-123'
      );
      expect(dynflowLink).toHaveAttribute('target', '_blank');
    });

    it('disables dynflow console link when dynflowEnableConsole is false', () => {
      render(<TaskButtons {...defaultProps} dynflowEnableConsole={false} />);
      const dynflowLink = screen.getByRole('link', {
        name: /dynflow console/i,
      });
      expect(dynflowLink).not.toBeDisabled();
    });

    it('enables dynflow console link when dynflowEnableConsole is true', () => {
      render(
        <TaskButtons
          {...defaultProps}
          dynflowEnableConsole
          externalId="external-123"
        />
      );
      const dynflowLink = screen.getByRole('link', {
        name: /dynflow console/i,
      });
      expect(dynflowLink).not.toBeDisabled();
    });

    it('disables resume and cancel buttons when canEdit is false', () => {
      render(<TaskButtons {...defaultProps} canEdit={false} />);
      expect(screen.getByRole('button', { name: /resume/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('disables resume button when resumable is false', () => {
      render(<TaskButtons {...defaultProps} canEdit resumable={false} />);
      expect(screen.getByRole('button', { name: /resume/i })).toBeDisabled();
    });

    it('disables cancel button when cancellable is false', () => {
      render(<TaskButtons {...defaultProps} canEdit cancellable={false} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('disables unlock button when state is not paused', () => {
      render(<TaskButtons {...defaultProps} canEdit state="running" />);
      expect(screen.getByRole('button', { name: /^unlock$/i })).toBeDisabled();
    });

    it('enables unlock button when state is paused and canEdit is true', () => {
      render(<TaskButtons {...defaultProps} canEdit state="paused" />);
      expect(
        screen.getByRole('button', { name: /^unlock$/i })
      ).not.toBeDisabled();
    });

    it('disables force unlock button when state is stopped', () => {
      render(<TaskButtons {...defaultProps} canEdit state="stopped" />);
      expect(
        screen.getByRole('button', { name: /force unlock/i })
      ).toBeDisabled();
    });

    it('enables force unlock button when state is not stopped and canEdit is true', () => {
      render(<TaskButtons {...defaultProps} canEdit state="running" />);
      expect(
        screen.getByRole('button', { name: /force unlock/i })
      ).not.toBeDisabled();
    });

    it('renders parent task button when parentTask is provided', () => {
      render(<TaskButtons {...defaultProps} parentTask="parent-123" />);
      const parentButton = screen.getByRole('link', { name: /parent task/i });
      expect(parentButton).toBeInTheDocument();
      expect(parentButton).toHaveAttribute(
        'href',
        '/foreman_tasks/tasks/parent-123'
      );
    });

    it('does not render parent task button when parentTask is not provided', () => {
      render(<TaskButtons {...defaultProps} />);
      expect(
        screen.queryByRole('link', { name: /parent task/i })
      ).not.toBeInTheDocument();
    });

    it('renders sub tasks button when hasSubTasks is true', () => {
      render(<TaskButtons {...defaultProps} hasSubTasks id="task-123" />);
      const subTasksButton = screen.getByRole('link', { name: /sub tasks/i });
      expect(subTasksButton).toBeInTheDocument();
      expect(subTasksButton).toHaveAttribute(
        'href',
        '/foreman_tasks/tasks/task-123/sub_tasks'
      );
    });

    it('does not render sub tasks button when hasSubTasks is false', () => {
      render(<TaskButtons {...defaultProps} hasSubTasks={false} />);
      expect(
        screen.queryByRole('link', { name: /sub tasks/i })
      ).not.toBeInTheDocument();
    });
  });
  describe('user interactions', () => {
    const cancelTaskRequest = jest.fn();
    const resumeTaskRequest = jest.fn();
    const taskProgressToggle = jest.fn();
    const taskReloadStart = jest.fn();
    const id = 'some-id';
    const action = 'some-action';
    const props = {
      ...defaultProps,
      taskReload: false,
      id,
      action,
      cancelTaskRequest,
      resumeTaskRequest,
      taskProgressToggle,
      taskReloadStart,
      status: STATUS.RESOLVED,
      canEdit: true,
      resumable: true,
      cancellable: true,
      state: 'paused',
    };

    it('calls taskProgressToggle when reload button is clicked', () => {
      render(<TaskButtons {...props} />);
      const reloadButton = screen.getByRole('button', {
        name: /start auto-reloading/i,
      });
      fireEvent.click(reloadButton);
      expect(taskProgressToggle).toHaveBeenCalled();
    });

    it('calls taskReloadStart and resumeTaskRequest when resume button is clicked', () => {
      render(<TaskButtons {...props} />);
      const resumeButton = screen.getByRole('button', { name: /resume/i });
      fireEvent.click(resumeButton);
      expect(taskReloadStart).toHaveBeenCalledWith(id);
      expect(resumeTaskRequest).toHaveBeenCalledWith(id, action);
    });

    it('calls taskReloadStart and cancelTaskRequest when cancel button is clicked', () => {
      render(<TaskButtons {...props} />);
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      expect(taskReloadStart).toHaveBeenCalledWith(id);
      expect(cancelTaskRequest).toHaveBeenCalledWith(id, action);
    });

    it('calls setUnlockModalOpen when unlock button is clicked', () => {
      render(<TaskButtons {...props} />);
      const unlockButton = screen.getByRole('button', { name: /^unlock$/i });
      fireEvent.click(unlockButton);
      expect(setUnlockModalOpen).toHaveBeenCalledWith(true);
    });

    it('calls setForceUnlockModalOpen when force unlock button is clicked', () => {
      render(<TaskButtons {...props} />);
      const forceUnlockButton = screen.getByRole('button', {
        name: /force unlock/i,
      });
      fireEvent.click(forceUnlockButton);
      expect(setForceUnlockModalOpen).toHaveBeenCalledWith(true);
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const openTaskActionsMenu = async () => {
  fireEvent.click(screen.getByRole('button', { name: /^task actions$/i }));

  await waitFor(() => {
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
};

describe('TaskButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('shows start auto-reloading in overflow when taskReload is false', async () => {
      render(<TaskButtons {...defaultProps} taskReload={false} />);
      await openTaskActionsMenu();
      expect(
        screen.getByRole('menuitem', { name: /start auto-reloading/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: /stop auto-reloading/i })
      ).not.toBeInTheDocument();
    });

    it('shows stop auto-reloading in overflow when taskReload is true', async () => {
      render(<TaskButtons {...defaultProps} taskReload />);
      await openTaskActionsMenu();
      expect(
        screen.getByRole('menuitem', { name: /stop auto-reloading/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: /start auto-reloading/i })
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

    it('marks dynflow console link disabled when dynflowEnableConsole is false', () => {
      render(
        <TaskButtons
          {...defaultProps}
          dynflowEnableConsole={false}
          externalId="ext-id"
        />
      );
      const dynflowLink = screen.getByRole('link', {
        name: /dynflow console/i,
      });
      expect(dynflowLink).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not disable dynflow console link when dynflowEnableConsole is true', () => {
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
      expect(dynflowLink.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('disables resume overflow item and cancel button when canEdit is false', async () => {
      render(<TaskButtons {...defaultProps} canEdit={false} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /^resume$/i })).toBeDisabled();
    });

    it('disables resume overflow item when resumable is false', async () => {
      render(<TaskButtons {...defaultProps} canEdit resumable={false} />);
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /^resume$/i })).toBeDisabled();
    });

    it('disables cancel button when cancellable is false', () => {
      render(<TaskButtons {...defaultProps} canEdit cancellable={false} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('disables unlock overflow item when state is not paused', async () => {
      render(<TaskButtons {...defaultProps} canEdit state="running" />);
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /^unlock$/i })).toBeDisabled();
    });

    it('enables unlock overflow item when state is paused and canEdit is true', async () => {
      render(<TaskButtons {...defaultProps} canEdit state="paused" />);
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /^unlock$/i })).not.toBeDisabled();
    });

    it('disables force unlock overflow item when state is stopped', async () => {
      render(<TaskButtons {...defaultProps} canEdit state="stopped" />);
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /force unlock/i })).toBeDisabled();
    });

    it('enables force unlock overflow item when state is not stopped and canEdit is true', async () => {
      render(<TaskButtons {...defaultProps} canEdit state="running" />);
      await openTaskActionsMenu();
      expect(screen.getByRole('menuitem', { name: /force unlock/i })).not.toBeDisabled();
    });

    it('includes parent task overflow item when parentTask is provided', async () => {
      render(<TaskButtons {...defaultProps} parentTask="parent-123" />);
      await openTaskActionsMenu();
      expect(
        screen.getByRole('menuitem', { name: /parent task/i })
      ).toBeInTheDocument();
    });

    it('does not include parent overflow item when parentTask is not provided', async () => {
      render(<TaskButtons {...defaultProps} />);
      await openTaskActionsMenu();
      expect(
        screen.queryByRole('menuitem', { name: /parent task/i })
      ).not.toBeInTheDocument();
    });

    it('includes sub tasks overflow item when hasSubTasks is true', async () => {
      render(<TaskButtons {...defaultProps} hasSubTasks id="task-123" />);
      await openTaskActionsMenu();
      expect(
        screen.getByRole('menuitem', { name: /sub tasks/i })
      ).toBeInTheDocument();
    });

    it('does not include sub tasks overflow item when hasSubTasks is false', async () => {
      render(<TaskButtons {...defaultProps} hasSubTasks={false} />);
      await openTaskActionsMenu();
      expect(
        screen.queryByRole('menuitem', { name: /sub tasks/i })
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

    it('calls taskProgressToggle when overflow reload item is clicked', async () => {
      render(<TaskButtons {...props} />);
      await openTaskActionsMenu();
      fireEvent.click(
        screen.getByRole('menuitem', { name: /start auto-reloading/i })
      );
      expect(taskProgressToggle).toHaveBeenCalled();
    });

    it('calls taskReloadStart and resumeTaskRequest when resume menu item is clicked', async () => {
      render(<TaskButtons {...props} />);
      await openTaskActionsMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /^resume$/i }));
      expect(taskReloadStart).toHaveBeenCalledWith(id);
      expect(resumeTaskRequest).toHaveBeenCalledWith(id, action);
    });

    it('calls taskReloadStart and cancelTaskRequest when cancel button is clicked', () => {
      render(<TaskButtons {...props} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(taskReloadStart).toHaveBeenCalledWith(id);
      expect(cancelTaskRequest).toHaveBeenCalledWith(id, action);
    });

    it('calls setUnlockModalOpen when unlock menu item is clicked', async () => {
      render(<TaskButtons {...props} />);
      await openTaskActionsMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /^unlock$/i }));
      expect(setUnlockModalOpen).toHaveBeenCalledWith(true);
    });

    it('calls setForceUnlockModalOpen when force unlock menu item is clicked', async () => {
      render(<TaskButtons {...props} />);
      await openTaskActionsMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /force unlock/i }));
      expect(setForceUnlockModalOpen).toHaveBeenCalledWith(true);
    });

    it('assigns window location for parent task overflow item', async () => {
      const assign = jest.fn();
      delete window.location;
      window.location = { ...window.location, assign };

      render(<TaskButtons {...props} parentTask="parent-xyz" />);
      await openTaskActionsMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /parent task/i }));
      expect(assign).toHaveBeenCalledWith('/foreman_tasks/tasks/parent-xyz');
    });

    it('assigns window location for sub tasks overflow item', async () => {
      const assign = jest.fn();
      delete window.location;
      window.location = { ...window.location, assign };

      render(<TaskButtons {...props} hasSubTasks />);
      await openTaskActionsMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: /sub tasks/i }));
      expect(assign).toHaveBeenCalledWith(
        `/foreman_tasks/tasks/${id}/sub_tasks`
      );
    });
  });
});

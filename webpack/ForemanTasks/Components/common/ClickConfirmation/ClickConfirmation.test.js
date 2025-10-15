import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ClickConfirmation,
  UnlockConfirmationModal,
  ForceUnlockConfirmationModal,
} from './';

describe('ClickConfirmation', () => {
  const defaultProps = {
    title: 'Test Modal',
    body: 'This is a test modal body',
    confirmationMessage: 'I understand the consequences',
    confirmAction: 'Confirm',
    onClick: jest.fn(),
    id: 'test-modal',
    isOpen: true,
    setModalClosed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders modal with correct title and content when open', () => {
      render(<ClickConfirmation {...defaultProps} />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a test modal body')).toBeInTheDocument();
      expect(
        screen.getByText('I understand the consequences')
      ).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<ClickConfirmation {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders with warning variant by default', () => {
      render(<ClickConfirmation {...defaultProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('renders with danger variant when specified', () => {
      render(<ClickConfirmation {...defaultProps} confirmType="danger" />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('pf-m-danger');
    });
  });

  describe('Checkbox Interaction', () => {
    it('starts with checkbox unchecked and confirm button disabled', () => {
      render(<ClickConfirmation {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      expect(checkbox).not.toBeChecked();
      expect(confirmButton).toBeDisabled();
    });

    it('enables confirm button when checkbox is checked', () => {
      render(<ClickConfirmation {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      fireEvent.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(confirmButton).toBeEnabled();
    });

    it('disables confirm button when checkbox is unchecked', () => {
      render(<ClickConfirmation {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // Check the checkbox first
      fireEvent.click(checkbox);
      expect(confirmButton).toBeEnabled();

      // Uncheck the checkbox
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Button Actions', () => {
    it('calls onClick and setModalClosed when confirm button is clicked', () => {
      const onClick = jest.fn();
      const setModalClosed = jest.fn();

      render(
        <ClickConfirmation
          {...defaultProps}
          onClick={onClick}
          setModalClosed={setModalClosed}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // Enable the button by checking the checkbox
      fireEvent.click(checkbox);

      // Click the confirm button
      fireEvent.click(confirmButton);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(setModalClosed).toHaveBeenCalledTimes(1);
    });

    it('calls setModalClosed when cancel button is clicked', () => {
      const setModalClosed = jest.fn();

      render(
        <ClickConfirmation {...defaultProps} setModalClosed={setModalClosed} />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(setModalClosed).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when confirm button is clicked while disabled', () => {
      const onClick = jest.fn();

      render(<ClickConfirmation {...defaultProps} onClick={onClick} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      // Try to click the disabled button
      fireEvent.click(confirmButton);

      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

describe('UnlockModal', () => {
  const defaultProps = {
    onClick: jest.fn(),
    id: 'unlock-modal',
    isOpen: true,
    setModalClosed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct unlock-specific content and warning variant', () => {
    render(<UnlockConfirmationModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Warning alert: Unlock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /This will unlock the resources that the task is running against/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'I understand that this may cause harm and have working database backups of all backend services.'
      )
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Unlock' });
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveClass('pf-m-primary');
  });
});

describe('ForceUnlockModal', () => {
  const defaultProps = {
    onClick: jest.fn(),
    id: 'force-unlock-modal',
    selectedRowsLen: 3,
    isOpen: true,
    setModalClosed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct force unlock-specific content and danger variant', () => {
    render(<ForceUnlockConfirmationModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Danger alert: Force Unlock' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Resources for 3 task\(s\) will be unlocked/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'I understand that this may cause harm and have working database backups of all backend services.'
      )
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Force Unlock' });
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveClass('pf-m-danger');
  });

  it('displays correct number of tasks in body', () => {
    render(
      <ForceUnlockConfirmationModal {...defaultProps} selectedRowsLen={5} />
    );

    expect(
      screen.getByText(/Resources for 5 task\(s\) will be unlocked/)
    ).toBeInTheDocument();
  });
});

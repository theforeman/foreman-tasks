import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionSelectButton } from '../ActionSelectButton';

const mockOnCancel = jest.fn();
const mockOnResume = jest.fn();
const mockOnForceCancel = jest.fn();

describe('ActionSelectButton', () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      onCancel: mockOnCancel,
      onResume: mockOnResume,
      onForceCancel: mockOnForceCancel,
      disabled: false,
    };
    return render(<ActionSelectButton {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with minimal props', () => {
    renderComponent();

    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeDisabled();
  });

  it('renders disabled when disabled prop is true', () => {
    renderComponent({ disabled: true });

    const toggle = screen.getByRole('button');
    expect(toggle).toBeDisabled();
  });

  it('opens dropdown and shows action options when toggle is clicked', async () => {
    renderComponent();
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText('Cancel Selected')).toBeInTheDocument();
      expect(screen.getByText('Resume Selected')).toBeInTheDocument();
      expect(screen.getByText('Force Cancel Selected')).toBeInTheDocument();
    });
  });

  it('calls onCancel when Cancel Selected is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Cancel Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Cancel Selected'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when Resume Selected is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Resume Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Resume Selected'));
    expect(mockOnResume).toHaveBeenCalledTimes(1);
  });

  it('calls onForceCancel when Force Cancel Selected is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Force Cancel Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Force Cancel Selected'));
    expect(mockOnForceCancel).toHaveBeenCalledTimes(1);
  });
});

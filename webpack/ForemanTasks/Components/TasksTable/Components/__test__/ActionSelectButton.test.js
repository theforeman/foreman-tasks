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
});

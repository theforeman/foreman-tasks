import React from 'react';
import { render } from '@testing-library/react';
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

    const actionButtons = document.querySelector('button');
    const content = JSON.parse(actionButtons.textContent);

    expect(content.buttons).toHaveLength(4);
    expect(content.buttons[0].title).toBe('Select Action');
    expect(content.buttons[1].title).toBe('Cancel Selected');
    expect(content.buttons[2].title).toBe('Resume Selected');
    expect(content.buttons[3].title).toBe('Force Cancel Selected');
  });
});

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

describe('Task', () => {
  it('renders task overview metadata via TaskInfo', () => {
    render(<Task id="test" action="Refresh hosts" />);

    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText('Refresh hosts')).toBeInTheDocument();
    expect(screen.getByText(/result:/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancel/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^task actions$/i })
    ).not.toBeInTheDocument();
  });
});

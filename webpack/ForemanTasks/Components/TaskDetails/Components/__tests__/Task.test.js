import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Task from '../Task';

jest.mock('foremanReact/components/common/dates/RelativeDateTime', () => {
  const RelativeDateTime = ({ date, defaultValue }) => (
    <span>{date || defaultValue}</span>
  );

  return RelativeDateTime;
});

describe('Task', () => {
  it('renders task overview metadata via TaskInfo', async () => {
    render(<Task id="test" action="Refresh hosts" />);

    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /show more details/i })
    );

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

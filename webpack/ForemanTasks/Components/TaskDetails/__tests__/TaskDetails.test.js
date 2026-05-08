import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskDetails from '../TaskDetails';
import { minProps } from './TaskDetails.fixtures';

delete window.location;
window.location = new URL(
  'https://foreman.com/foreman_tasks/tasks/a15dd820-32f1-4ced-9ab7-c0fab8234c47/'
);

describe('TaskDetails', () => {
  it('shows error message when status is ERROR', () => {
    render(
      <TaskDetails
        {...minProps}
        status="ERROR"
        APIerror={{ message: 'some-error' }}
      />
    );
    expect(
      screen.getByText(/could not receive data: some-error/i)
    ).toBeInTheDocument();
  });

  it('shows skeleton while loading on the Task tab', () => {
    const { container } = render(<TaskDetails {...minProps} isLoading />);
    expect(
      container.querySelector('.react-loading-skeleton')
    ).toBeInTheDocument();
  });

  it('renders six tabs with expected labels', () => {
    render(<TaskDetails {...minProps} />);
    expect(screen.getByRole('tab', { name: /^task$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /running steps/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /errors/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /locks/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /dependencies/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /raw/i })).toBeInTheDocument();
  });

  it('associates tab list with task id from URL', () => {
    render(<TaskDetails {...minProps} />);
    expect(document.getElementById('task-details-tabs')).toBeInTheDocument();
  });
});

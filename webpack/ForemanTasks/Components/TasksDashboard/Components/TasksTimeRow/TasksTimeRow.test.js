import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksTimeRow from './TasksTimeRow';

describe('TasksTimeRow', () => {
  it('renders the time label and defaults the dropdown to 24h', () => {
    render(<TasksTimeRow />);

    expect(screen.getByText('With focus on last')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /24h/i })).toBeInTheDocument();
  });

  it('renders the dropdown with the provided time selection', () => {
    render(
      <TasksTimeRow
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK}
        updateTime={jest.fn()}
      />
    );

    expect(screen.getByText('With focus on last')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^week$/i })).toBeInTheDocument();
  });

  it('calls updateTime when a different time option is selected', async () => {
    const updateTime = jest.fn();

    render(
      <TasksTimeRow
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.H24}
        updateTime={updateTime}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /24h/i }));

    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: /^12h$/i }));

    await waitFor(() => {
      expect(updateTime).toHaveBeenCalledTimes(1);
      expect(updateTime).toHaveBeenCalledWith(
        TASKS_DASHBOARD_AVAILABLE_TIMES.H12
      );
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../../../TasksDashboardConstants';
import ScheduledTasksCard from './ScheduledTasksCard';

const { SCHEDULED } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;

describe('ScheduledTasksCard', () => {
  it('renders scheduled count, labels, and card structure', () => {
    render(<ScheduledTasksCard data={3} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(document.getElementById('scheduled-tasks-card')).toBeInTheDocument();
    expect(document.querySelector('.scheduled-data')?.textContent).toContain(
      '3'
    );
  });

  it('merges optional className onto the card', () => {
    const { container } = render(
      <ScheduledTasksCard className="extra-scheduled-class" />
    );
    expect(container.querySelector('.extra-scheduled-class')).toBeInTheDocument();
  });

  it('marks the card selected when query state is scheduled', () => {
    const { container } = render(
      <ScheduledTasksCard query={{ state: SCHEDULED }} />
    );
    expect(container.querySelector('#scheduled-tasks-card')).toHaveClass(
      'selected-tasks-card'
    );
  });

  it('calls updateQuery with scheduled state when title or data area is clicked', () => {
    const updateQuery = jest.fn();
    render(<ScheduledTasksCard updateQuery={updateQuery} />);

    fireEvent.click(screen.getByText('Scheduled'));
    expect(updateQuery).toHaveBeenCalledWith({ state: SCHEDULED });

    updateQuery.mockClear();
    fireEvent.click(document.querySelector('.scheduled-data'));
    expect(updateQuery).toHaveBeenCalledWith({ state: SCHEDULED });
  });
});

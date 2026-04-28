import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../../../TasksDashboardConstants';
import TasksDonutCard from './TasksDonutCard';

jest.mock('../TasksDonutChart/TasksDonutChart', () => {
  const React = require('react');
  const Stub = props => (
    <div
      data-testid="tasks-donut-chart-stub"
      data-focused-on={props.focusedOn}
      data-time={props.time}
    />
  );
  Stub.displayName = 'TasksDonutChart';
  return Stub;
});

describe('TasksDonutCard', () => {
  const baseProps = {
    title: 'Card title',
    wantedQueryState: 'running',
    data: { last: 3, older: 5 },
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
  };

  it('renders title and wires chart stub with time and focus from query', () => {
    render(
      <TasksDonutCard
        {...baseProps}
        query={{ state: 'running', mode: TASKS_DASHBOARD_AVAILABLE_QUERY_MODES.LAST, time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK }}
      />
    );
    expect(screen.getByText('Card title')).toBeInTheDocument();
    const chart = screen.getByTestId('tasks-donut-chart-stub');
    expect(chart).toHaveAttribute('data-focused-on', 'last');
  });

  it('clicking the title requests the wanted query state', () => {
    const updateQuery = jest.fn();
    render(<TasksDonutCard {...baseProps} updateQuery={updateQuery} />);
    fireEvent.click(screen.getByText('Card title'));
    expect(updateQuery).toHaveBeenCalledWith({ state: 'running' });
  });

  it('applies selected styling when this card state matches the query (total focus)', () => {
    const { container } = render(
      <TasksDonutCard {...baseProps} query={{ state: 'running' }} />
    );
    expect(container.querySelector('.tasks-donut-card')).toHaveClass(
      'selected-tasks-card'
    );
  });

  it('applies not-focused when another dashboard state is active', () => {
    const { container } = render(
      <TasksDonutCard {...baseProps} query={{ state: 'paused' }} />
    );
    expect(container.querySelector('.tasks-donut-card')).toHaveClass(
      'not-focused'
    );
  });

  it('merges className onto the card', () => {
    const { container } = render(
      <TasksDonutCard {...baseProps} className="extra-donut" />
    );
    expect(container.querySelector('.tasks-donut-card')).toHaveClass(
      'extra-donut'
    );
  });

  it('does not mark the card selected or dimmed when the query is empty', () => {
    const { container } = render(<TasksDonutCard {...baseProps} query={{}} />);
    const card = container.querySelector('.tasks-donut-card');
    expect(card).not.toHaveClass('selected-tasks-card');
    expect(card).not.toHaveClass('not-focused');
  });
});

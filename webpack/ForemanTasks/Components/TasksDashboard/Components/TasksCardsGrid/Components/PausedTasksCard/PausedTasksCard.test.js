import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from '../TasksDonutChart/TasksDonutChartConstants';

import PausedTasksCard from './PausedTasksCard';

jest.mock('../TasksDonutChart/TasksDonutChart', () => {
  const React = require('react');
  const Stub = props => (
    <div
      data-testid="tasks-donut-chart-stub"
      data-last={props.last}
      data-older={props.older}
      data-focused-on={props.focusedOn}
    />
  );
  Stub.displayName = 'TasksDonutChart';
  return Stub;
});

describe('PausedTasksCard', () => {
  it('renders Paused title, card id, and chart area', () => {
    render(<PausedTasksCard />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(document.getElementById('paused-tasks-card')).toBeInTheDocument();
    const chart = screen.getByTestId('tasks-donut-chart-stub');
    expect(chart).toHaveAttribute('data-last', '0');
    expect(chart).toHaveAttribute('data-older', '0');
    expect(chart).toHaveAttribute(
      'data-focused-on',
      TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.NORMAL
    );
  });

  it('forwards extra props to the underlying donut card', () => {
    const updateQuery = jest.fn();
    render(
      <PausedTasksCard
        updateQuery={updateQuery}
        data={{ last: 1, older: 2 }}
        query={{ state: 'paused' }}
      />
    );
    const chart = screen.getByTestId('tasks-donut-chart-stub');
    expect(chart).toHaveAttribute('data-last', '1');
    expect(chart).toHaveAttribute('data-older', '2');
    expect(chart).toHaveAttribute(
      'data-focused-on',
      TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.TOTAL
    );

    fireEvent.click(screen.getByText('Paused'));
    expect(updateQuery).toHaveBeenCalledWith({ state: 'paused' });
  });
});

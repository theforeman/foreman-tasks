import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from '../TasksDonutChart/TasksDonutChartConstants';

import RunningTasksCard from './RunningTasksCard';

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

describe('RunningTasksCard', () => {
  it('renders Running title, card id, and chart area', () => {
    render(<RunningTasksCard />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(document.getElementById('running-tasks-card')).toBeInTheDocument();
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
      <RunningTasksCard
        updateQuery={updateQuery}
        data={{ last: 2, older: 4 }}
        query={{ state: 'running' }}
      />
    );
    const chart = screen.getByTestId('tasks-donut-chart-stub');
    expect(chart).toHaveAttribute('data-last', '2');
    expect(chart).toHaveAttribute('data-older', '4');
    expect(chart).toHaveAttribute(
      'data-focused-on',
      TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS.TOTAL
    );

    fireEvent.click(screen.getByText('Running'));
    expect(updateQuery).toHaveBeenCalledWith({ state: 'running' });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../TasksDonutChart/TasksDonutChart', () => {
  const React = require('react');
  const Stub = () => <div data-testid="tasks-donut-chart-stub" />;
  Stub.displayName = 'TasksDonutChart';
  return Stub;
});

import RunningTasksCard from './RunningTasksCard';

describe('RunningTasksCard', () => {
  it('renders Running title, card id, and chart area', () => {
    render(<RunningTasksCard />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(document.getElementById('running-tasks-card')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-donut-chart-stub')).toBeInTheDocument();
  });

  it('forwards extra props to the underlying donut card', () => {
    render(
      <RunningTasksCard
        updateQuery={jest.fn()}
        data={{ last: 2, older: 4 }}
        query={{ state: 'running' }}
      />
    );
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(document.getElementById('running-tasks-card')).toBeInTheDocument();
  });
});

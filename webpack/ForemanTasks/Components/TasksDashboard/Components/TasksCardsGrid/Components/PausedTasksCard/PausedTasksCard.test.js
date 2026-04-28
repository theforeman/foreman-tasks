import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../TasksDonutChart/TasksDonutChart', () => {
  const React = require('react');
  const Stub = () => <div data-testid="tasks-donut-chart-stub" />;
  Stub.displayName = 'TasksDonutChart';
  return Stub;
});

import PausedTasksCard from './PausedTasksCard';

describe('PausedTasksCard', () => {
  it('renders Paused title, card id, and chart area', () => {
    render(<PausedTasksCard />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(document.getElementById('paused-tasks-card')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-donut-chart-stub')).toBeInTheDocument();
  });

  it('forwards extra props to the underlying donut card', () => {
    render(
      <PausedTasksCard
        updateQuery={jest.fn()}
        data={{ last: 1, older: 2 }}
        query={{ state: 'paused' }}
      />
    );
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(document.getElementById('paused-tasks-card')).toBeInTheDocument();
  });
});

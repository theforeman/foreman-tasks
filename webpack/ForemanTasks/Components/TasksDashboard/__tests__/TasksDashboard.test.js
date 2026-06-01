import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../TasksDashboardConstants';
import { getQueryFromUrl } from '../TasksDashboardHelper';
import TasksDashboard from '../TasksDashboard';

jest.mock('../TasksDashboardHelper', () => ({
  ...jest.requireActual('../TasksDashboardHelper'),
  getQueryFromUrl: jest.fn(() => ({})),
}));

jest.mock(
  '../Components/TasksCardsGrid/Components/TasksDonutChart/TasksDonutChart',
  () => {
    const React = require('react');
    const Stub = () => <div data-testid="tasks-donut-chart-stub" />;
    Stub.displayName = 'TasksDonutChart';

    return Stub;
  }
);

describe('TasksDashboard', () => {
  const cardIds = [
    'running-tasks-card',
    'paused-tasks-card',
    'stopped-tasks-card',
    'scheduled-tasks-card',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getQueryFromUrl.mockReturnValue({});
  });

  it('renders the dashboard grid with time picker and task cards', () => {
    const { container } = render(<TasksDashboard history={{}} />);

    expect(container.querySelector('.tasks-dashboard-grid')).toBeInTheDocument();
    expect(screen.getByText('With focus on last')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /24h/i })
    ).toBeInTheDocument();

    cardIds.forEach(id => {
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
    });
  });

  it('initializes the dashboard and fetches the summary on mount', () => {
    const initializeDashboard = jest.fn();
    const fetchTasksSummary = jest.fn();

    render(
      <TasksDashboard
        history={{}}
        initializeDashboard={initializeDashboard}
        fetchTasksSummary={fetchTasksSummary}
      />
    );

    expect(initializeDashboard).toHaveBeenCalledWith({
      time: undefined,
      query: {},
    });
    expect(fetchTasksSummary).toHaveBeenCalledWith(
      TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
      ''
    );
  });

  it('fetches the summary again when time changes', () => {
    const fetchTasksSummary = jest.fn();

    const { rerender } = render(
      <TasksDashboard
        history={{}}
        fetchTasksSummary={fetchTasksSummary}
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.H24}
      />
    );

    fetchTasksSummary.mockClear();

    rerender(
      <TasksDashboard
        history={{}}
        fetchTasksSummary={fetchTasksSummary}
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.H12}
      />
    );

    expect(fetchTasksSummary).toHaveBeenCalledWith(
      TASKS_DASHBOARD_AVAILABLE_TIMES.H12,
      ''
    );
  });
});

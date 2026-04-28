import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./Components/TasksDonutChart/TasksDonutChart', () => {
  const React = require('react');
  const Stub = () => <div data-testid="tasks-donut-chart-stub" />;
  Stub.displayName = 'TasksDonutChart';
  return Stub;
});

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../TasksDashboardConstants';
import { MOCKED_DATA } from './TasksCardsGrid.fixtures';
import TasksCardsGrid from './TasksCardsGrid';

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    time: TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK,
    query: { state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING },
    data: MOCKED_DATA,
    updateQuery: jest.fn(),
  },
};


describe('TasksCardsGrid layout', () => {
  it('uses PatternFly Grid with gutter and four responsive columns', () => {
    const { container } = render(<TasksCardsGrid />);
    const grid = container.querySelector('.pf-v5-l-grid.pf-m-gutter');
    expect(grid).toBeInTheDocument();
    const items = container.querySelectorAll(
      '.pf-v5-l-grid > .pf-v5-l-grid__item'
    );
    expect(items).toHaveLength(4);
    items.forEach(item => {
      expect(item).toHaveClass('pf-m-12-col-on-sm');
      expect(item).toHaveClass('pf-m-6-col-on-md');
      expect(item).toHaveClass('pf-m-3-col-on-xl');
    });
  });

  it('renders each card full-height and reflects dashboard query and data', () => {
    const updateQuery = jest.fn();
    const query = { state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING };
    const { container } = render(
      <TasksCardsGrid
        query={query}
        updateQuery={updateQuery}
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK}
        data={MOCKED_DATA}
      />
    );

    const cardIds = [
      'running-tasks-card',
      'paused-tasks-card',
      'stopped-tasks-card',
      'scheduled-tasks-card',
    ];

    cardIds.forEach(id => {
      const card = container.querySelector(`#${id}`);
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('pf-m-full-height');
    });

    expect(container.querySelector('#running-tasks-card')).toHaveClass(
      'selected-tasks-card'
    );

    const scheduledDataEl = container.querySelector(
      '#scheduled-tasks-card .scheduled-data'
    );
    expect(scheduledDataEl?.textContent).toContain(
      String(MOCKED_DATA[TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED])
    );
  });
});

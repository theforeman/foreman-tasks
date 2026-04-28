import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS } from './TasksDonutChartConstants';
import TasksDonutChart from './TasksDonutChart';

jest.mock('./TasksDonutChartHelper', () => {
  const actual = jest.requireActual('./TasksDonutChartHelper');
  return {
    ...actual,
    getBaseChartConfig: jest.fn(() => ({ mockBase: true })),
    updateChartTitle: jest.fn(),
    assignExtraChartEvents: jest.fn(),
    clearExtraChartEvents: jest.fn(),
  };
});

jest.mock('../../../../../../Components/Chart/Chart', () => {
  const React = require('react');
  return class MockChart extends React.Component {
    componentDidMount() {
      this.props.onChartCreate?.({
        element: {},
        focus: jest.fn(),
        revert: jest.fn(),
      });
    }

    render() {
      return <div data-testid="chart-root" className={this.props.className} />;
    }
  };
});

const { NORMAL, TOTAL } = TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS;

describe('TasksDonutChart', () => {
  const required = { last: 3, older: 5 };

  it('renders a chart with donut classes', () => {
    render(<TasksDonutChart {...required} />);
    const root = screen.getByTestId('chart-root');
    expect(root).toHaveClass('donut-chart-pf', 'tasks-donut-chart');
  });

  it('adds selection class when focusedOn is not normal or none', () => {
    render(<TasksDonutChart {...required} focusedOn={TOTAL} />);
    expect(screen.getByTestId('chart-root')).toHaveClass('tasks-donut-selected');
  });

  it('does not add selection class in normal focus', () => {
    render(<TasksDonutChart {...required} focusedOn={NORMAL} />);
    expect(screen.getByTestId('chart-root')).not.toHaveClass(
      'tasks-donut-selected'
    );
  });

  it('merges custom className', () => {
    render(<TasksDonutChart {...required} className="custom-chart" />);
    expect(screen.getByTestId('chart-root')).toHaveClass('custom-chart');
  });
});

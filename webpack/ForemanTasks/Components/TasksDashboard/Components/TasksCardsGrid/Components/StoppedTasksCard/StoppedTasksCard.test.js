import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
} from '../../../../TasksDashboardConstants';
import StoppedTasksCard from './StoppedTasksCard';

const { STOPPED, RUNNING } = TASKS_DASHBOARD_AVAILABLE_QUERY_STATES;
const { LAST } = TASKS_DASHBOARD_AVAILABLE_QUERY_MODES;
const { WEEK } = TASKS_DASHBOARD_AVAILABLE_TIMES;

const defaultTableData = {
  results: {
    error: { total: 9, last: 1 },
    warning: { total: 8, last: 2 },
    success: { total: 7, last: 3 },
  },
  other: 0,
};

describe('StoppedTasksCard', () => {
  describe('rendering', () => {
    it('renders card with base classes and id', () => {
      const { container } = render(<StoppedTasksCard />);
      const card = container.querySelector('#stopped-tasks-card');
      expect(screen.getByText('Stopped')).toBeInTheDocument();
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('tasks-donut-card');
      expect(card).toHaveClass('stopped-tasks-card');
    });

    it('renders selected state when query.state is STOPPED', () => {
      const { container } = render(
        <StoppedTasksCard query={{ state: STOPPED }} />
      );
      expect(screen.getByText('Stopped')).toBeInTheDocument();
      const card = container.querySelector('#stopped-tasks-card');
      expect(card).toHaveClass('selected-tasks-card');
    });

    it('renders not-focused state when query.state is not STOPPED', () => {
      const { container } = render(
        <StoppedTasksCard query={{ state: RUNNING }} />
      );
      const card = container.querySelector('#stopped-tasks-card');
      expect(card).toHaveClass('not-focused');
      expect(card).not.toHaveClass('selected-tasks-card');
    });

    it('renders StoppedTable with Error, Warning, Success labels', () => {
      render(<StoppedTasksCard />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Other:')).toBeInTheDocument();
    });

    it('renders data counts from props', () => {
      const data = {
        results: {
          error: { total: 5, last: 2 },
          warning: { total: 3, last: 1 },
          success: { total: 10, last: 4 },
        },
        other: 7,
      };
      render(<StoppedTasksCard data={data} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls updateQuery with state STOPPED when title is clicked', () => {
      const updateQuery = jest.fn();
      render(<StoppedTasksCard updateQuery={updateQuery} />);
      fireEvent.click(screen.getByText('Stopped'));
      expect(updateQuery).toHaveBeenCalledWith({ state: STOPPED });
    });
  });

  describe('StoppedTable (via StoppedTasksCard)', () => {
    it('renders table with data and time', () => {
      render(
        <StoppedTasksCard
          data={defaultTableData}
          time={WEEK}
          query={{}}
          updateQuery={jest.fn()}
        />
      );
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('week')).toBeInTheDocument();
    });

    it('applies active class to Total cell when query has state STOPPED and result (total selected)', () => {
      const { container } = render(
        <StoppedTasksCard
          data={defaultTableData}
          time={WEEK}
          query={{ state: STOPPED, result: 'error' }}
          updateQuery={jest.fn()}
        />
      );
      const table = container.querySelector('.stopped-table');
      expect(table).toBeInTheDocument();
      const activeCells = table.querySelectorAll('.data-col.active');
      expect(activeCells).toHaveLength(1);
      expect(activeCells[0].textContent).toBe('9');
    });

    ['warning', 'success'].forEach(result => {
      it(`applies active class to Total cell when result is ${result} (total selected)`, () => {
        const { container } = render(
          <StoppedTasksCard
            data={defaultTableData}
            time={WEEK}
            query={{ state: STOPPED, result }}
            updateQuery={jest.fn()}
          />
        );
        const table = container.querySelector('.stopped-table');
        const activeCells = table.querySelectorAll('.data-col.active');
        expect(activeCells.length).toBe(1);
        const expectedTotal = result === 'warning' ? '8' : '7';
        expect(activeCells[0].textContent).toBe(expectedTotal);
      });
    });

    it('applies active class to Last time cell when query has result, mode LAST and time (last selected)', () => {
      const { container } = render(
        <StoppedTasksCard
          data={defaultTableData}
          time={WEEK}
          query={{
            state: STOPPED,
            result: 'error',
            mode: LAST,
            time: WEEK,
          }}
          updateQuery={jest.fn()}
        />
      );
      const table = container.querySelector('.stopped-table');
      const activeCells = table.querySelectorAll('.data-col.active');
      expect(activeCells).toHaveLength(1);
      expect(activeCells[0].textContent).toBe('1');
    });

    it('calls updateQuery with state and result when Total is clicked', () => {
      const updateQuery = jest.fn();
      render(
        <StoppedTasksCard
          data={defaultTableData}
          time={WEEK}
          query={{}}
          updateQuery={updateQuery}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '9' }));
      expect(updateQuery).toHaveBeenCalledWith({
        state: STOPPED,
        result: 'error',
      });
    });

    it('calls updateQuery with state, result, mode LAST and time when Last time is clicked', () => {
      const updateQuery = jest.fn();
      render(
        <StoppedTasksCard
          data={defaultTableData}
          time={WEEK}
          query={{}}
          updateQuery={updateQuery}
        />
      );
      const lastButtons = screen.getAllByRole('button', { name: '1' });
      fireEvent.click(lastButtons[0]);
      expect(updateQuery).toHaveBeenCalledWith({
        state: STOPPED,
        result: 'error',
        mode: LAST,
        time: WEEK,
      });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { getQueryKeyText, getQueryValueText } from '../../TasksDashboardHelper';
import TasksLabelsRow from './TasksLabelsRow';

jest.mock('../../TasksDashboardHelper');

getQueryKeyText.mockImplementation(val => val);
getQueryValueText.mockImplementation(val => val);

describe('TasksLabelsRow', () => {
  describe('rendering', () => {
    it('renders nothing when query is empty', () => {
      render(<TasksLabelsRow />);
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument();
    });

    it('renders Active Filters category and label when query has entries', () => {
      render(
        <TasksLabelsRow query={{ some: 'query' }} updateQuery={jest.fn()} />
      );
      expect(screen.getByText('Active Filters')).toBeInTheDocument();
      expect(screen.getByText('some = query')).toBeInTheDocument();
    });
  });

  describe('triggering', () => {
    it('calls updateQuery with remaining query when a label close button is clicked', () => {
      const updateQuery = jest.fn();
      const query = { some: 'query', someOther: 'some-query' };

      render(<TasksLabelsRow query={query} updateQuery={updateQuery} />);

      const firstLabelCloseButton = screen.getByRole('button', {
        name: /close some = query/i,
      });
      fireEvent.click(firstLabelCloseButton);
      expect(updateQuery).toHaveBeenCalledWith({ someOther: 'some-query' });

      const secondLabelCloseButton = screen.getByRole('button', {
        name: /close someOther = some-query/i,
      });
      fireEvent.click(secondLabelCloseButton);
      expect(updateQuery).toHaveBeenCalledWith({ some: 'query' });
    });

    it('calls updateQuery with empty object when close label group button is clicked', () => {
      const updateQuery = jest.fn();
      const query = { some: 'query', someOther: 'some-query' };

      render(<TasksLabelsRow query={query} updateQuery={updateQuery} />);

      const closeGroupButton = screen.getByRole('button', {
        name: /close label group/i,
      });
      fireEvent.click(closeGroupButton);

      expect(updateQuery).toHaveBeenCalledWith({});
    });
  });
});

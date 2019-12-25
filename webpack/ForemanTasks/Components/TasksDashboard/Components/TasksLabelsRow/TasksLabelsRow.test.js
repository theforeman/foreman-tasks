import React from 'react';
import { testComponentSnapshotsWithFixtures, shallow } from '@theforeman/test';

import { getQueryKeyText, getQueryValueText } from '../../TasksDashboardHelper';
import TasksLabelsRow from './TasksLabelsRow';

jest.mock('../../TasksDashboardHelper');

getQueryKeyText.mockImplementation(val => val);
getQueryValueText.mockImplementation(val => val);

const fixtures = {
  'render with minimal props': {},
  'render with props': {
    query: { some: 'query' },
    updateQuery: jest.fn(),
  },
};

describe('TasksLabelsRow', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksLabelsRow, fixtures));

  describe('triggering', () => {
    it('should trigger updateQuery when label delete-click', () => {
      const updateQuery = jest.fn();
      const query = { some: 'query', someOther: 'some-query' };

      const component = shallow(
        <TasksLabelsRow query={query} updateQuery={updateQuery} />
      );
      const labels = component.find('Label');

      const firstLabel = labels.first();
      const secondLabel = labels.at(1);

      firstLabel.simulate('removeClick');
      expect(updateQuery).toHaveBeenCalledWith({ someOther: 'some-query' });

      secondLabel.simulate('removeClick');
      expect(updateQuery).toHaveBeenCalledWith({ some: 'query' });
    });

    it('should trigger updateQuery when -clear-all- click', () => {
      const updateQuery = jest.fn();
      const query = { some: 'query', someOther: 'some-query' };

      const component = shallow(
        <TasksLabelsRow query={query} updateQuery={updateQuery} />
      );
      component.find('Button').simulate('click');

      expect(updateQuery).toHaveBeenCalledWith({});
    });
  });
});

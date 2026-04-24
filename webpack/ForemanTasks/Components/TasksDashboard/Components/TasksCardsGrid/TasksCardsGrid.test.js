import React from 'react';
import { shallow } from 'enzyme';
import { Grid, GridItem } from '@patternfly/react-core';
import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../TasksDashboardConstants';
import { MOCKED_DATA } from './TasksCardsGrid.fixtures';
import RunningTasksCard from './Components/RunningTasksCard/RunningTasksCard';
import PausedTasksCard from './Components/PausedTasksCard/PausedTasksCard';
import StoppedTasksCard from './Components/StoppedTasksCard/StoppedTasksCard';
import ScheduledTasksCard from './Components/ScheduledTasksCard/ScheduledTasksCard';
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

describe('TasksCardsGrid', () =>
  testComponentSnapshotsWithFixtures(TasksCardsGrid, fixtures));

describe('TasksCardsGrid layout', () => {
  it('uses PatternFly Grid with gutter and four responsive columns', () => {
    const wrapper = shallow(<TasksCardsGrid />);
    const grid = wrapper.find(Grid);
    expect(grid).toHaveLength(1);
    expect(grid.prop('hasGutter')).toBe(true);
    expect(grid.prop('className')).toContain('tasks-cards-grid');
    const items = wrapper.find(GridItem);
    expect(items).toHaveLength(4);
    items.forEach(item => {
      expect(item.prop('sm')).toBe(12);
      expect(item.prop('md')).toBe(6);
      expect(item.prop('xl')).toBe(3);
    });
  });

  it('passes isFullHeight and dashboard props to each card', () => {
    const updateQuery = jest.fn();
    const query = { state: TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING };
    const wrapper = shallow(
      <TasksCardsGrid
        query={query}
        updateQuery={updateQuery}
        time={TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK}
        data={MOCKED_DATA}
      />
    );
    const cardChecks = [
      [RunningTasksCard, TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING],
      [PausedTasksCard, TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.PAUSED],
      [StoppedTasksCard, TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.STOPPED],
      [ScheduledTasksCard, TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.SCHEDULED],
    ];
    cardChecks.forEach(([CardComponent, stateKey], index) => {
      const card = wrapper.find(GridItem).at(index).find(CardComponent);
      expect(card.prop('isFullHeight')).toBe(true);
      expect(card.prop('query')).toEqual(query);
      expect(card.prop('updateQuery')).toBe(updateQuery);
      expect(card.prop('time')).toBe(TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK);
      expect(card.prop('data')).toEqual(MOCKED_DATA[stateKey]);
    });
  });
});

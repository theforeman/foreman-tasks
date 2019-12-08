import React from 'react';
import { number, text, select, action } from '@theforeman/stories';

import { withCardsDecorator } from '../../../../../../../stories/decorators';

import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
} from '../../../../TasksDashboardConstants';
import TasksDonutCard from './TasksDonutCard';

export default {
  title: 'TasksDashboard/TasksCardsGrid/Cards/TasksDonutCard',
  component: TasksDonutCard,
  decorators: [withCardsDecorator],
  parameters: {
    centered: { disable: true },
  },
};

export const Basic = () => {
  const selectTime = select(
    'time',
    TASKS_DASHBOARD_AVAILABLE_TIMES,
    TasksDonutCard.defaultProps.time
  );

  const selectMode = select(
    'mode',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_MODES, NONE: 'none' },
    'none'
  );

  return (
    <TasksDonutCard
      title={text('title', 'Some Title')}
      data={{
        last: number('data.last', 3),
        older: number('data.older', 5),
      }}
      time={selectTime}
      query={{
        state: text('query.state', 'some-state'),
        mode: selectMode,
        time: selectTime,
      }}
      wantedQueryState={text('wantedQueryState', 'wanted-state')}
      updateQuery={action('updateQuery')}
    />
  );
};

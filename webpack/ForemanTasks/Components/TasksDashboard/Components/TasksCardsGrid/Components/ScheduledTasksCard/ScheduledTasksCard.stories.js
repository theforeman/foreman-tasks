import React from 'react';
import { number, select, action } from '@theforeman/stories';

import { withCardsDecorator } from '../../../../../../../stories/decorators';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../../../TasksDashboardConstants';
import ScheduledTasksCard from './ScheduledTasksCard';

export default {
  title: 'TasksDashboard/TasksCardsGrid/Cards/ScheduledTasksCard',
  component: ScheduledTasksCard,
  decorators: [withCardsDecorator],
  parameters: {
    centered: { disable: true },
  },
};

export const Basic = () => {
  const selectState = select(
    'query.state',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_STATES, NONE: 'none' },
    'none'
  );
  return (
    <ScheduledTasksCard
      data={number('data', 1)}
      query={{
        state: selectState,
      }}
      updateQuery={action('updateQuery')}
    />
  );
};

import React from 'react';
import { number, select, action } from '@theforeman/stories';

import { withCardsDecorator } from '../../../../../../../stories/decorators';

import {
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
} from '../../../../TasksDashboardConstants';
import RunningTasksCard from './RunningTasksCard';

export default {
  title: 'TasksDashboard/TasksCardsGrid/Cards/RunningTasksCard',
  component: RunningTasksCard,
  decorators: [withCardsDecorator],
  parameters: {
    centered: { disable: true },
  },
};

export const Basic = () => {
  const selectTime = select(
    'time',
    TASKS_DASHBOARD_AVAILABLE_TIMES,
    RunningTasksCard.defaultProps.time
  );

  const selectMode = select(
    'mode',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_MODES, NONE: 'none', TOTAL: null },
    'none'
  );
  return (
    <RunningTasksCard
      data={{
        last: number('data.last', 3),
        older: number('data.older', 5),
      }}
      time={selectTime}
      query={{
        state: select(
          'query.state',
          {
            ...TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
            NONE: null,
          },
          TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.RUNNING
        ),
        mode: selectMode,
        time: selectTime,
      }}
      updateQuery={action('updateQuery')}
    />
  );
};

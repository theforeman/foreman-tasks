import React from 'react';
import { number, select, action } from '@theforeman/stories';

import { withCardsDecorator } from '../../../../../../../stories/decorators';

import {
  TASKS_DASHBOARD_AVAILABLE_TIMES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_STATES,
  TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS,
  TASKS_DASHBOARD_AVAILABLE_QUERY_MODES,
} from '../../../../TasksDashboardConstants';
import StoppedTasksCard from './StoppedTasksCard';

export default {
  title: 'TasksDashboard/TasksCardsGrid/Cards/StoppedTasksCard',
  component: StoppedTasksCard,
  decorators: [withCardsDecorator],
  parameters: {
    centered: { disable: true },
  },
};

export const Basic = () => {
  const selectTime = select(
    'time',
    TASKS_DASHBOARD_AVAILABLE_TIMES,
    StoppedTasksCard.defaultProps.time
  );
  const selectState = select(
    'query.state',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_STATES, NONE: null },
    TASKS_DASHBOARD_AVAILABLE_QUERY_STATES.STOPPED
  );
  const selectResult = select(
    'query.result',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_RESULTS, NONE: null },
    null
  );
  const selectMode = select(
    'query.mode',
    { ...TASKS_DASHBOARD_AVAILABLE_QUERY_MODES, NONE: null },
    null
  );
  return (
    <div>
      <StoppedTasksCard
        data={{
          error: {
            total: number('errorTotal', 8),
            last: number('errorLast', 1),
          },
          warning: {
            total: number('warningTotal', 20),
            last: number('warningLast', 2),
          },
          success: {
            total: number('successTotal', 25),
            last: number('successLast', 3),
          },
        }}
        time={selectTime}
        query={{
          state: selectState,
          result: selectResult,
          mode: selectMode,
          time: selectTime,
        }}
        updateQuery={action('updateQuery')}
      />
    </div>
  );
};

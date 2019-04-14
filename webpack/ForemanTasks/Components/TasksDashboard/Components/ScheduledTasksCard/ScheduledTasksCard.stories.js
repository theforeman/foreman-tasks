import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../stories/decorators';

import { TASKS_DASHBOARD_AVAILABLE_QUERY_STATES } from '../../TasksDashboardConstants';
import ScheduledTasksCard from './ScheduledTasksCard';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('ScheduledTasksCard', () => {
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
  });

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
      <div>
        <link
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          rel="stylesheet"
          integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
          crossOrigin="anonymous"
        />
        <ScheduledTasksCard
          data={number('data', 1)}
          query={{
            state: selectState,
          }}
          updateQuery={action('updateQuery')}
        />
      </div>
    );
  });

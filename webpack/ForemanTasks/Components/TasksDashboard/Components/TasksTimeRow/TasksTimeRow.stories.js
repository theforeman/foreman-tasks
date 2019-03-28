import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../stories/decorators';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksTimeRow from './TasksTimeRow';

storiesOf('TasksDashboard/TasksTimeRow', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('TasksTimeRow', () => (
    <TasksTimeRow
      time={select(
        'time',
        TASKS_DASHBOARD_AVAILABLE_TIMES,
        TASKS_DASHBOARD_AVAILABLE_TIMES.H24
      )}
      updateTime={action('updateTime')}
    />
  ));

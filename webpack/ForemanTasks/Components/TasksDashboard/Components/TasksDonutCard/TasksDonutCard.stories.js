import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withCardsDecorator } from '../../../../../stories/decorators';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY } from '../TasksDonutChart/TasksDonutChartConstants';
import TasksDonutCard from './TasksDonutCard';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .addDecorator(withCardsDecorator)
  .add('TasksDonutCard', () => (
    <TasksDonutCard
      title={text('title', 'Some Title')}
      last={number('last', 3)}
      older={number('older', 5)}
      timePeriod={text('timePeriod', '24h')}
      focusedOn={select(
        'focusedOn',
        TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY,
        TasksDonutCard.defaultProps.focusedOn
      )}
      onTotalClick={action('onTotalClick')}
      onLastClick={action('onLastClick')}
      onOlderClick={action('onOlderClick')}
    />
  ));

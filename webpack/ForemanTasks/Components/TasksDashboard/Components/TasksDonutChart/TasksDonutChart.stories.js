import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY } from './TasksDonutChartConstants';
import TasksDonutChart from './TasksDonutChart';

storiesOf('TasksDashboard', module)
  .addDecorator(withKnobs)
  .add('TasksDonutChart', () => (
    <TasksDonutChart
      last={number('last', 3)}
      older={number('older', 5)}
      time={text('time', '24h')}
      focusedOn={select(
        'focusedOn',
        TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY,
        TasksDonutChart.defaultProps.focusedOn
      )}
      onTotalClick={action('onTotalClick')}
      onLastClick={action('onLastClick')}
      onOlderClick={action('onOlderClick')}
    />
  ));

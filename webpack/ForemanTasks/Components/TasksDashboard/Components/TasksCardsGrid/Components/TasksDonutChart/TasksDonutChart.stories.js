import React from 'react';
import { number, text, select, action } from '@theforeman/stories';

import { TASKS_DONUT_CHART_FOCUSED_ON_OPTIONS_ARRAY } from './TasksDonutChartConstants';
import TasksDonutChart from './TasksDonutChart';

export default {
  title: 'TasksDashboard/TasksCardsGrid/Charts/TasksDonutChart',
  component: TasksDonutChart,
};

export const Basic = () => (
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
);

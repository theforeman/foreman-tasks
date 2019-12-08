import React, { useState } from 'react';
import { select, action } from '@theforeman/stories';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksTimeRow from './TasksTimeRow';

export default {
  title: 'TasksDashboard/TasksTimeRow',
  component: TasksTimeRow,
};

export const withState = () => {
  const [time, updateTime] = useState(TASKS_DASHBOARD_AVAILABLE_TIMES.H24);

  return <TasksTimeRow time={time} updateTime={updateTime} />;
};

export const withKnobs = () => (
  <TasksTimeRow
    time={select(
      'time',
      TASKS_DASHBOARD_AVAILABLE_TIMES,
      TASKS_DASHBOARD_AVAILABLE_TIMES.H24
    )}
    updateTime={action('updateTime')}
  />
);

export const with24Hours = () => (
  <TasksTimeRow time={TASKS_DASHBOARD_AVAILABLE_TIMES.H24} />
);

export const with12Hours = () => (
  <TasksTimeRow time={TASKS_DASHBOARD_AVAILABLE_TIMES.H12} />
);

export const withWeek = () => (
  <TasksTimeRow time={TASKS_DASHBOARD_AVAILABLE_TIMES.WEEK} />
);

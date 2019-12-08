import React from 'react';
import { object, action } from '@theforeman/stories';

import { TASKS_DASHBOARD_AVAILABLE_TIMES } from '../../TasksDashboardConstants';
import TasksLabelsRow from './TasksLabelsRow';

export default {
  title: 'TasksDashboard/TasksLabelsRow',
  component: TasksLabelsRow,
};

export const Basic = () => (
  <TasksLabelsRow
    query={object('query', {
      state: 'running',
      mode: 'last',
      time: TASKS_DASHBOARD_AVAILABLE_TIMES.H24,
    })}
    updateQuery={action('updateQuery')}
  />
);

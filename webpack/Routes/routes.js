import React from 'react';
import TasksTableIndexPage from '../ForemanTasks/Components/TasksTable/TasksIndexPage';

const ForemanTasksRoutes = [
  {
    path: '/foreman_tasks/tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
  {
    path: '/foreman_tasks/tasks/:id/sub_tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
];

export default ForemanTasksRoutes;

import React from 'react';
import TasksTableIndexPage from '../ForemanTasks/Components/TasksTable/TasksIndexPage';
import TaskDetailsPage from '../ForemanTasks/Routes/ShowTaskDetails/TaskDetailsPage';

const ForemanTasksRoutes = [
  {
    path: '/foreman_tasks/tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
  {
    path: '/foreman_tasks/tasks/:id',
    exact: true,
    render: props => <TaskDetailsPage {...props} />,
  },
  {
    path: '/foreman_tasks/tasks/:id/sub_tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
];

export default ForemanTasksRoutes;

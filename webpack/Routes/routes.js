import React from 'react';
import TasksTableIndexPage from '../ForemanTasks/Components/TasksTable/TasksIndexPage';
import ShowTask from '../ForemanTasks/Routes/ShowTask/ShowTask';

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
  {
    path: '/foreman_tasks/ex_tasks/:id',
    render: props => <ShowTask {...props} />,
  },
];

export default ForemanTasksRoutes;

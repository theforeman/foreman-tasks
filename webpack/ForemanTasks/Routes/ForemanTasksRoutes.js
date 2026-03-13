import React from 'react';
import TasksTableIndexPage from '../Components/TasksTable/TasksIndexPage';
import ShowTask from './ShowTask';

const ForemanTasksRoutes = {
  indexTasks: {
    path: '/foreman_tasks/tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
  subTasks: {
    path: '/foreman_tasks/tasks/:id/sub_tasks',
    exact: true,
    render: props => <TasksTableIndexPage {...props} />,
  },
  showTask: {
    path: '/foreman_tasks/ex_tasks/:id',
    render: props => <ShowTask {...props} />,
  },
};

export default ForemanTasksRoutes;

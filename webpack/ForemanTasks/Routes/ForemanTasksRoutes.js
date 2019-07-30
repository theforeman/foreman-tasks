import React from 'react';
import { TasksIndexPage } from '../Components/TasksTable/TasksIndexPage';
import { SubTasksPage } from '../Components/TasksTable/SubTasksPage';
import ShowTask from './ShowTask';

const ForemanTasksRoutes = {
  indexTasks: {
    path: '/foreman_tasks/tasks',
    exact: true,
    render: props => <TasksIndexPage {...props} />,
  },
  subTasks: {
    path: '/foreman_tasks/tasks/:id/sub_tasks',
    exact: true,
    render: props => <SubTasksPage {...props} />,
  },
  showTask: {
    path: '/foreman_tasks/ex_tasks/:id',
    render: props => <ShowTask {...props} />,
  },
};

export default ForemanTasksRoutes;

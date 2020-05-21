import React from 'react';
import { foremanUrl } from 'foremanReact/common/urlHelpers'
import { TasksIndexPage } from '../Components/TasksTable/TasksIndexPage';
import { SubTasksPage } from '../Components/TasksTable/SubTasksPage';
import ShowTask from './ShowTask';

const ForemanTasksRoutes = {
  indexTasks: {
    path: foremanUrl('/foreman_tasks/tasks'),
    exact: true,
    render: props => <TasksIndexPage {...props} />,
  },
  subTasks: {
    path: foremanUrl('/foreman_tasks/tasks/:id/sub_tasks'),
    exact: true,
    render: props => <SubTasksPage {...props} />,
  },
  showTask: {
    path: foremanUrl('/foreman_tasks/ex_tasks/:id'),
    render: props => <ShowTask {...props} />,
  },
};

export default ForemanTasksRoutes;

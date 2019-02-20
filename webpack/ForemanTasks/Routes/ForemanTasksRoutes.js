import React from 'react';
import IndexTasks from './IndexTasks';
import ShowTask from './ShowTask';

const ForemanTasksRoutes = {
  indexTasks: {
    path: '/foreman_tasks/ex_tasks',
    exact: true,
    render: props => <IndexTasks {...props} />,
  },
  showTask: {
    path: '/foreman_tasks/ex_tasks/:id',
    render: props => <ShowTask {...props} />,
  },
};

export default ForemanTasksRoutes;

import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import TasksTablePage from './';

export const TasksIndexPage = props => {
  const getBreadcrumbs = () => ({
    breadcrumbItems: [{ caption: __('Tasks'), url: `/foreman_tasks/tasks` }],
  });
  return <TasksTablePage getBreadcrumbs={getBreadcrumbs} {...props} />;
};

import React from 'react';
import { foremanUrl } from 'foremanReact/common/urlHelpers';
import { translate as __ } from 'foremanReact/common/I18n';
import TasksTablePage from './';

export const TasksIndexPage = props => {
  const getBreadcrumbs = () => ({
    breadcrumbItems: [{ caption: __('Tasks'), url: foremanUrl('/foreman_tasks/tasks') }],
  });
  return <TasksTablePage getBreadcrumbs={getBreadcrumbs} {...props} />;
};

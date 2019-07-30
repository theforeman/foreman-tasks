import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'foremanReact/common/I18n';
import TasksTablePage from './';

export const SubTasksPage = props => {
  const getBreadcrumbs = actionName => ({
    breadcrumbItems: [
      { caption: __('Tasks'), url: `/foreman_tasks/tasks` },
      {
        caption: actionName,
        url: `/foreman_tasks/tasks/${props.match.params.id}`,
      },
      { caption: __('Sub tasks') },
    ],
  });
  return <TasksTablePage getBreadcrumbs={getBreadcrumbs} {...props} />;
};

SubTasksPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object,
  }),
};

SubTasksPage.defaultProps = {
  match: {
    params: {},
  },
};

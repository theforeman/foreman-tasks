import React from 'react';
import PropTypes from 'prop-types';
import { sprintf, translate as __ } from 'foremanReact/common/I18n';
import TasksTablePage from './';

export const SubTasksPage = props => {
  const parentTaskID = props.match.params.id;
  const getBreadcrumbs = actionName => ({
    breadcrumbItems: [
      { caption: __('Tasks'), url: `/foreman_tasks/tasks` },
      {
        caption: actionName,
        url: `/foreman_tasks/tasks/${parentTaskID}`,
      },
      { caption: __('Sub tasks') },
    ],
  });
  const createHeader = actionName =>
    actionName ? sprintf(__('Sub tasks of %s'), actionName) : __('Sub tasks');
  return (
    <TasksTablePage
      getBreadcrumbs={getBreadcrumbs}
      parentTaskID={parentTaskID}
      createHeader={createHeader}
      {...props}
    />
  );
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

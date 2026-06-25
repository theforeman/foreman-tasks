import React from 'react';
import PropTypes from 'prop-types';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import TaskDetails from '../../Components/TaskDetails/TaskDetails';
import TaskDetailsHeader from './TaskDetailsHeader';

const TaskDetailsPage = props => {
  const { match, action } = props;
  const { id } = match.params;
  const headerText = action
    ? sprintf(__('Details of %s task'), action)
    : __('Task Details');

  return (
    <PageLayout
      customHeader={<TaskDetailsHeader {...props} />}
      header={headerText}
      searchable={false}
      breadcrumbOptions={{
        breadcrumbItems: [
          { caption: __('Tasks'), url: '/foreman_tasks/tasks' },
          { caption: action || id },
        ],
        isSwitchable: true,
        resource: {
          nameField: 'action',
          resourceUrl: '/foreman_tasks/api/tasks',
          switcherItemUrl: '/foreman_tasks/tasks/:id',
        },
      }}
    >
      <TaskDetails {...props} />
    </PageLayout>
  );
};

TaskDetailsPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  action: PropTypes.string,
};

TaskDetailsPage.defaultProps = {
  action: '',
};

export default TaskDetailsPage;

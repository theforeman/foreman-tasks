import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Flex, FlexItem, TextContent, Text } from '@patternfly/react-core';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __, sprintf } from 'foremanReact/common/I18n';
import TaskDetails from '../../Components/TaskDetails';
import {
  selectAction,
  selectResult,
  selectState,
} from '../../Components/TaskDetails/TaskDetailsSelectors';
import { taskResultIconEl } from '../../Components/common/taskResultIcon';

const TaskDetailsPage = props => {
  const { id } = props.match.params;
  const action = useSelector(selectAction);
  const taskState = useSelector(selectState);
  const taskResult = useSelector(selectResult);
  const headerText = action
    ? sprintf(__('Details of %s task'), action)
    : __('Task Details');

  const header = (
    <Flex
      component="span"
      data-ouia-component-id="foreman-tasks-task-details-title-row"
      display={{ default: 'inlineFlex' }}
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
    >
      <TextContent>
        <Text ouiaId="breadcrumb_title" component="h1">
          {headerText}
        </Text>
      </TextContent>
      <FlexItem component="span">
        {taskResultIconEl(taskState, taskResult)}
      </FlexItem>
    </Flex>
  );

  return (
    <PageLayout
      customHeader={header}
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
};

export default TaskDetailsPage;

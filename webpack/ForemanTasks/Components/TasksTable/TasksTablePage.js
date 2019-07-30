import React from 'react';
import PropTypes from 'prop-types';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { Spinner } from 'patternfly-react';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { getURIQuery } from 'foremanReact/common/helpers';
import ExportButton from 'foremanReact/routes/common/PageLayout/components/ExportButton/ExportButton';
import { STATUS } from 'foremanReact/constants';
import TasksDashboard from '../TasksDashboard';
import TasksTable from './TasksTable';
import { resolveSearchQuery, addSearchToURL } from './TasksTableHelpers';
import { TASKS_SEARCH_PROPS } from './TasksTableConstants';
import './TasksTablePage.scss';

const TasksTablePage = ({ getBreadcrumbs, ...props }) => {
  const onSearch = searchQuery => {
    resolveSearchQuery(searchQuery);
    props.getTableItems();
  };

  return (
    <div className="tasks-table-wrapper">
      <PageLayout
        searchable
        searchProps={TASKS_SEARCH_PROPS}
        onSearch={onSearch}
        breadcrumbOptions={getBreadcrumbs(props.actionName)}
        toolbarButtons={
          <React.Fragment>
            {props.status === STATUS.PENDING && <Spinner size="lg" loading />}
            <ExportButton
              url={addSearchToURL(
                '/foreman_tasks/tasks.csv',
                getURIQuery(window.location.href)
              )}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={<TasksDashboard />}
      >
        <TasksTable {...props} />
      </PageLayout>
    </div>
  );
};

TasksTablePage.propTypes = {
  getTableItems: PropTypes.func.isRequired,
  getBreadcrumbs: PropTypes.func.isRequired,
  actionName: PropTypes.string,
  isSubTask: PropTypes.bool,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  location: PropTypes.object.isRequired,
};

TasksTablePage.defaultProps = {
  actionName: '',
  isSubTask: false,
  status: STATUS.PENDING,
};

export default TasksTablePage;

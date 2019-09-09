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

const TasksTablePage = ({ getBreadcrumbs, history, ...props }) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);
  const onSearch = searchQuery => {
    resolveSearchQuery(searchQuery, history);
    props.getTableItems(url);
  };

  return (
    <div className="tasks-table-wrapper">
      <PageLayout
        searchable
        searchProps={TASKS_SEARCH_PROPS}
        onSearch={onSearch}
        breadcrumbOptions={getBreadcrumbs(props.actionName)}
        toastNotifications="foreman-tasks-cancel"
        toolbarButtons={
          <React.Fragment>
            {props.status === STATUS.PENDING && <Spinner size="lg" loading />}
            <ExportButton
              url={addSearchToURL('/foreman_tasks/tasks.csv', uriQuery)}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={<TasksDashboard history={history} />}
      >
        <TasksTable history={history} {...props} />
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
  history: PropTypes.object.isRequired,
};

TasksTablePage.defaultProps = {
  actionName: '',
  isSubTask: false,
  status: STATUS.PENDING,
};

export default TasksTablePage;

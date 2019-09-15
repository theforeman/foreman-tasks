import React from 'react';
import PropTypes from 'prop-types';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { Spinner, Button } from 'patternfly-react';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import ExportButton from 'foremanReact/routes/common/PageLayout/components/ExportButton/ExportButton';
import { STATUS } from 'foremanReact/constants';
import TasksDashboard from '../TasksDashboard';
import TasksTable from './TasksTable';
import { resolveSearchQuery, addSearchToURL } from './TasksTableHelpers';
import { TASKS_SEARCH_PROPS } from './TasksTableConstants';
import { ActionConfirmation } from './Components/ActionConfirmation';
import './TasksTablePage.scss';

const TasksTablePage = ({ getBreadcrumbs, history, ...props }) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);
  const onSearch = searchQuery => {
    resolveSearchQuery(searchQuery, history);
    props.getTableItems(url);
  };

  const getSelected = () => {
    const selected = props.results.filter(item =>
      props.selectedRows.includes(item.id)
    );
    return selected.map(item => ({
      name: item.action,
      id: item.id,
      isCancelleble: item.availableActions.cancellable,
    }));
  };

  return (
    <div className="tasks-table-wrapper">
      <ActionConfirmation
        showModal={props.isCancelAllModalOpen}
        closeModal={props.hideCancelAllModal}
        title={__('Cancel Selected Tasks')}
        message={__(
          `This will stop ${props.selectedRows.length} tasks, putting them in the "canceled" state.  Are you sure?`
        )}
        onClick={() => {
          props.cancelSelected(getSelected(), url);
          props.hideCancelAllModal();
        }}
        confirmAction={__('Yes')}
        abortAction={__('No')}
      />
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
              title={__('Export All')}
            />
            <Button
              disabled={props.selectedRows.length < 1}
              onClick={props.showCancelAllModal}
            >
              {__('Cancel Selected')}
            </Button>
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
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  getBreadcrumbs: PropTypes.func.isRequired,
  actionName: PropTypes.string,
  isSubTask: PropTypes.bool,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  history: PropTypes.object.isRequired,
  cancelSelected: PropTypes.func.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  isCancelAllModalOpen: PropTypes.bool.isRequired,
  showCancelAllModal: PropTypes.func.isRequired,
  hideCancelAllModal: PropTypes.func.isRequired,
};

TasksTablePage.defaultProps = {
  actionName: '',
  isSubTask: false,
  status: STATUS.PENDING,
  selectedRows: [],
};

export default TasksTablePage;

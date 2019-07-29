import React from 'react';
import PropTypes from 'prop-types';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { Spinner } from 'patternfly-react';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import ExportButton from 'foremanReact/routes/common/PageLayout/components/ExportButton/ExportButton';
import { STATUS } from 'foremanReact/constants';
import TasksDashboard from '../TasksDashboard';
import TasksTable from './TasksTable';
import { resolveSearchQuery, addSearchToURL } from './TasksTableHelpers';
import { CancelResumeConfirm } from './Components/CancelResumeConfirm';
import {
  TASKS_SEARCH_PROPS,
  RESUME,
  CANCEL,
  CLOSED,
} from './TasksTableConstants';
import { ActionSelectButton } from './Components/ActionSelectButton';
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
      isResumeble: item.availableActions.resumable,
    }));
  };

  const TaskSelectedAction = (id, name) => {
    props.actionSelected(id, name, url);
  };

  return (
    <div className="tasks-table-wrapper">
      <CancelResumeConfirm
        closeModal={props.hideSelcetedModal}
        action={TaskSelectedAction}
        selected={getSelected()}
        modalStatus={props.modalStatus}
        selectedRowsLen={props.selectedRows.length}
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
            <ActionSelectButton
              disabled={props.selectedRows.length < 1}
              onCancel={props.showCancelSelcetedModal}
              onResume={props.showResumeSelcetedModal}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={
          <TasksDashboard history={history} parentTaskID={props.parentTaskID} />
        }
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
  status: PropTypes.oneOf(Object.keys(STATUS)),
  history: PropTypes.object.isRequired,
  actionSelected: PropTypes.func.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  showResumeSelcetedModal: PropTypes.func.isRequired,
  showCancelSelcetedModal: PropTypes.func.isRequired,
  hideSelcetedModal: PropTypes.func.isRequired,
  modalStatus: PropTypes.oneOf([CANCEL, RESUME, CLOSED]),
  parentTaskID: PropTypes.string,
};

TasksTablePage.defaultProps = {
  actionName: '',
  status: STATUS.PENDING,
  selectedRows: [],
  modalStatus: CLOSED,
  parentTaskID: null,
};

export default TasksTablePage;

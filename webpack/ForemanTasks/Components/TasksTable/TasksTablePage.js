import React from 'react';
import PropTypes from 'prop-types';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { Spinner } from 'patternfly-react';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import ExportButton from 'foremanReact/routes/common/PageLayout/components/ExportButton/ExportButton';
import { STATUS } from 'foremanReact/constants';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import TasksDashboard from '../TasksDashboard';
import TasksTable from './TasksTable';
import { resolveSearchQuery, getCSVurl } from './TasksTableHelpers';
import { ConfirmationModals } from './Components/ConfirmationModals';
import {
  TASKS_SEARCH_PROPS,
  CANCEL_SELECTED_CONFIRM_MODAL_ID,
  RESUME_SELECTED_CONFIRM_MODAL_ID,
  RESUME_CONFIRM_MODAL_ID,
  CANCEL_CONFIRM_MODAL_ID,
} from './TasksTableConstants';
import { ActionSelectButton } from './Components/ActionSelectButton';
import './TasksTablePage.scss';
import { SelectAllAlert } from './Components/SelectAllAlert';

const TasksTablePage = ({
  getBreadcrumbs,
  history,
  clicked,
  createHeader,
  selectAllRows,
  showSelectAll,
  ...props
}) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);
  const onSearch = searchQuery => {
    resolveSearchQuery(searchQuery, history);
  };

  const getSelectedTasks = () => {
    const selectedIDs = props.results.filter(item =>
      props.selectedRows.includes(item.id)
    );
    return selectedIDs.map(item => ({
      name: item.action,
      id: item.id,
      isCancellable: item.availableActions.cancellable,
      isResumable: item.availableActions.resumable,
    }));
  };

  const modalProps = {
    cancelSelectedModal: useForemanModal({
      id: CANCEL_SELECTED_CONFIRM_MODAL_ID,
    }),
    resumeSelectedModal: useForemanModal({
      id: RESUME_SELECTED_CONFIRM_MODAL_ID,
    }),
    cancelModal: useForemanModal({ id: CANCEL_CONFIRM_MODAL_ID }),
    resumeModal: useForemanModal({ id: RESUME_CONFIRM_MODAL_ID }),
  };

  const {
    bulkCancelById,
    bulkCancelBySearch,
    bulkResumeById,
    bulkResumeBySearch,
    cancelTask,
    resumeTask,
    parentTaskID,
  } = props;
  const tasksActions = {
    cancelSelectedTasks: () => {
      props.allRowsSelected
        ? bulkCancelBySearch({ query: uriQuery, parentTaskID })
        : bulkCancelById({
            selected: getSelectedTasks(),
            url,
            parentTaskID,
          });
    },
    cancelTask: () => {
      cancelTask({
        taskId: clicked.taskId,
        taskName: clicked.taskName,
        url,
        parentTaskID,
      });
    },
    resumeSelectedTasks: () => {
      props.allRowsSelected
        ? bulkResumeBySearch({ query: uriQuery, parentTaskID })
        : bulkResumeById({
            selected: getSelectedTasks(),
            url,
            parentTaskID,
          });
    },
    resumeTask: () => {
      resumeTask({
        taskId: clicked.taskId,
        taskName: clicked.taskName,
        url,
        parentTaskID,
      });
    },
  };

  return (
    <div className="tasks-table-wrapper">
      <ConfirmationModals
        tasksActions={tasksActions}
        selectedRowsLen={
          props.allRowsSelected ? props.itemCount : props.selectedRows.length
        }
        modalProps={modalProps}
      />
      <PageLayout
        searchable
        searchProps={TASKS_SEARCH_PROPS}
        onSearch={onSearch}
        header={createHeader(props.actionName)}
        breadcrumbOptions={getBreadcrumbs(props.actionName)}
        toastNotifications="foreman-tasks-cancel"
        toolbarButtons={
          <React.Fragment>
            {props.status === STATUS.PENDING && <Spinner size="lg" loading />}
            <ExportButton
              url={getCSVurl(url, uriQuery)}
              title={__('Export All')}
            />
            <ActionSelectButton
              disabled={!(props.selectedRows.length || props.allRowsSelected)}
              onCancel={modalProps.cancelSelectedModal.setModalOpen}
              onResume={modalProps.resumeSelectedModal.setModalOpen}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={
          <TasksDashboard history={history} parentTaskID={props.parentTaskID} />
        }
      >
        <React.Fragment>
          {showSelectAll && props.itemCount >= props.pagination.perPage && (
            <SelectAllAlert
              itemCount={props.itemCount}
              perPage={props.pagination.perPage}
              selectAllRows={selectAllRows}
              unselectAllRows={props.unselectAllRows}
              allRowsSelected={props.allRowsSelected}
            />
          )}
          <TasksTable history={history} {...props} modalProps={modalProps} />
        </React.Fragment>
      </PageLayout>
    </div>
  );
};

TasksTablePage.propTypes = {
  allRowsSelected: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    perPage: PropTypes.number,
  }),
  selectAllRows: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  getBreadcrumbs: PropTypes.func.isRequired,
  actionName: PropTypes.string,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  history: PropTypes.object.isRequired,
  cancelTask: PropTypes.func.isRequired,
  resumeTask: PropTypes.func.isRequired,
  bulkCancelById: PropTypes.func.isRequired,
  bulkCancelBySearch: PropTypes.func.isRequired,
  bulkResumeById: PropTypes.func.isRequired,
  bulkResumeBySearch: PropTypes.func.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  parentTaskID: PropTypes.string,
  createHeader: PropTypes.func,
  clicked: PropTypes.shape({
    taskId: PropTypes.string,
    taskName: PropTypes.string,
    parentTaskID: PropTypes.string,
  }),
  showSelectAll: PropTypes.bool,
  unselectAllRows: PropTypes.func.isRequired,
};

TasksTablePage.defaultProps = {
  pagination: {
    page: 1,
    perPage: 20,
  },
  allRowsSelected: false,
  actionName: '',
  status: STATUS.PENDING,
  selectedRows: [],
  parentTaskID: null,
  clicked: {},
  createHeader: () => __('Tasks'),
  showSelectAll: false,
};

export default TasksTablePage;

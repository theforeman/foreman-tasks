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
import { resolveSearchQuery, addSearchToURL } from './TasksTableHelpers';
import { ConfirmationModals } from './Components/ConfirmationModals';
import {
  TASKS_SEARCH_PROPS,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  RESUME_MODAL,
  CANCEL_MODAL,
  CONFIRM_MODAL,
} from './TasksTableConstants';
import { ActionSelectButton } from './Components/ActionSelectButton';
import './TasksTablePage.scss';

const TasksTablePage = ({
  getBreadcrumbs,
  history,
  clicked,
  createHeader,
  modalID,
  openModalAction,
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

  const {
    bulkCancel,
    bulkResume,
    cancelTask,
    resumeTask,
    parentTaskID,
  } = props;
  const tasksActions = {
    [CANCEL_SELECTED_MODAL]: () => {
      bulkCancel({ selected: getSelectedTasks(), url, parentTaskID });
    },
    [CANCEL_MODAL]: () => {
      cancelTask({
        taskId: clicked.taskId,
        taskName: clicked.taskName,
        url,
        parentTaskID,
      });
    },
    [RESUME_SELECTED_MODAL]: () => {
      bulkResume({ selected: getSelectedTasks(), url, parentTaskID });
    },
    [RESUME_MODAL]: () => {
      resumeTask({
        taskId: clicked.taskId,
        taskName: clicked.taskName,
        url,
        parentTaskID,
      });
    },
  };

  const { setModalOpen, setModalClosed } = useForemanModal({
    id: CONFIRM_MODAL,
  });
  const openModal = id => openModalAction(id, setModalOpen);

  return (
    <div className="tasks-table-wrapper">
      <ConfirmationModals
        tasksActions={tasksActions}
        selectedRowsLen={props.selectedRows.length}
        setModalClosed={setModalClosed}
        modalID={modalID}
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
              url={addSearchToURL('/foreman_tasks/tasks.csv', uriQuery)}
              title={__('Export All')}
            />
            <ActionSelectButton
              disabled={props.selectedRows.length < 1}
              onCancel={() => openModal(CANCEL_SELECTED_MODAL)}
              onResume={() => openModal(RESUME_SELECTED_MODAL)}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={
          <TasksDashboard history={history} parentTaskID={props.parentTaskID} />
        }
      >
        <TasksTable history={history} {...props} openModal={openModal} />
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
  cancelTask: PropTypes.func.isRequired,
  resumeTask: PropTypes.func.isRequired,
  bulkCancel: PropTypes.func.isRequired,
  bulkResume: PropTypes.func.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  parentTaskID: PropTypes.string,
  createHeader: PropTypes.func,
  clicked: PropTypes.shape({
    taskId: PropTypes.string,
    taskName: PropTypes.string,
    parentTaskID: PropTypes.string,
  }),
  modalID: PropTypes.string,
  openModalAction: PropTypes.func.isRequired,
};

TasksTablePage.defaultProps = {
  actionName: '',
  status: STATUS.PENDING,
  selectedRows: [],
  parentTaskID: null,
  clicked: {},
  createHeader: () => __('Tasks'),
  modalID: '',
};

export default TasksTablePage;

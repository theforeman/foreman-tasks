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
  RESUME,
  CANCEL,
  CANCEL_SELECTED_CONFIRM_MODAL_ID,
  RESUME_SELECTED_CONFIRM_MODAL_ID,
  RESUME_CONFIRM_MODAL_ID,
  CANCEL_CONFIRM_MODAL_ID,
} from './TasksTableConstants';
import { ActionSelectButton } from './Components/ActionSelectButton';
import './TasksTablePage.scss';

const TasksTablePage = ({ getBreadcrumbs, history, clicked, ...props }) => {
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

  const tasksActions = {
    cancelSelectedTasks: () => {
      props.actionSelected(CANCEL, getSelected(), url, props.parentTaskID);
    },
    cancelTask: () => {
      props.cancelTask(
        clicked.taskId,
        clicked.taskName,
        url,
        props.parentTaskID
      );
    },
    resumeSelectedTasks: () => {
      props.actionSelected(RESUME, getSelected(), url, props.parentTaskID);
    },
    resumeTask: () => {
      props.resumeTask(
        clicked.taskId,
        clicked.taskName,
        url,
        props.parentTaskID
      );
    },
  };
  return (
    <div className="tasks-table-wrapper">
      <ConfirmationModals
        tasksActions={tasksActions}
        selectedRowsLen={props.selectedRows.length}
        modalProps={modalProps}
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
        <TasksTable history={history} {...props} modalProps={modalProps} />
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
  cancelTask: PropTypes.func.isRequired,
  resumeTask: PropTypes.func.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  parentTaskID: PropTypes.string,
  clicked: PropTypes.shape({
    taskId: PropTypes.string,
    taskName: PropTypes.string,
    parentTaskID: PropTypes.string,
  }),
};

TasksTablePage.defaultProps = {
  actionName: '',
  status: STATUS.PENDING,
  selectedRows: [],
  parentTaskID: null,
  clicked: {},
};

export default TasksTablePage;

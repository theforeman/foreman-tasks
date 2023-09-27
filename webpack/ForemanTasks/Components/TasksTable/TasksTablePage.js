import React from 'react';
import PropTypes from 'prop-types';
import URI from 'urijs';
import { getURIsearch } from 'foremanReact/common/urlHelpers';
import { Spinner, Button, Icon } from 'patternfly-react';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import ExportButton from 'foremanReact/routes/common/PageLayout/components/ExportButton/ExportButton';
import { STATUS } from 'foremanReact/constants';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import TasksDashboard from '../TasksDashboard';
import TasksTable from './TasksTable';
import { getCSVurl, updateURlQuery } from './TasksTableHelpers';
import ConfirmModal from './Components/ConfirmModal/';
import {
  TASKS_SEARCH_PROPS,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  FORCE_UNLOCK_SELECTED_MODAL,
  CONFIRM_MODAL,
} from './TasksTableConstants';
import { ActionSelectButton } from './Components/ActionSelectButton';
import './TasksTablePage.scss';
import { SelectAllAlert } from './Components/SelectAllAlert';

const TasksTablePage = ({
  getBreadcrumbs,
  history,
  createHeader,
  selectAllRows,
  showSelectAll,
  modalID,
  openModalAction,
  ...props
}) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);
  const onSearch = search => {
    const uri = new URI(url);
    if (uri.search(true).search === search && uri.search(true).page === '1') {
      props.getTableItems(uri);
    } else {
      const newUriQuery = {
        search,
        page: 1,
      };
      updateURlQuery(newUriQuery, history);
    }
  };

  const { setModalOpen, setModalClosed } = useForemanModal({
    id: CONFIRM_MODAL,
  });

  const openModal = id => openModalAction(id, setModalOpen);

  return (
    <div className="tasks-table-wrapper">
      <ConfirmModal
        id={CONFIRM_MODAL}
        url={url}
        parentTaskID={props.parentTaskID}
        uriQuery={uriQuery}
        setModalClosed={setModalClosed}
      />
      <PageLayout
        searchable
        searchProps={TASKS_SEARCH_PROPS}
        onSearch={onSearch}
        header={createHeader(props.actionName)}
        breadcrumbOptions={getBreadcrumbs(props.actionName)}
        toolbarButtons={
          <React.Fragment>
            <Button onClick={() => props.reloadPage(url, props.parentTaskID)}>
              <Icon type="fa" name="refresh" /> {__('Refresh Data')}
            </Button>
            {props.status === STATUS.PENDING && <Spinner size="md" loading />}
            <ExportButton
              url={getCSVurl(history.location.pathname, uriQuery)}
              title={__('Export All')}
            />
            <ActionSelectButton
              disabled={
                !props.permissions.edit ||
                !(props.selectedRows.length || props.allRowsSelected)
              }
              onCancel={() => openModal(CANCEL_SELECTED_MODAL)}
              onResume={() => openModal(RESUME_SELECTED_MODAL)}
              onForceCancel={() => openModal(FORCE_UNLOCK_SELECTED_MODAL)}
            />
          </React.Fragment>
        }
        searchQuery={getURIsearch()}
        beforeToolbarComponent={
          <TasksDashboard history={history} parentTaskID={props.parentTaskID} />
        }
      >
        <React.Fragment>
          {props.permissions.edit &&
            showSelectAll &&
            props.itemCount >= props.perPage && (
              <SelectAllAlert
                itemCount={props.itemCount}
                perPage={props.perPage}
                selectAllRows={selectAllRows}
                unselectAllRows={props.unselectAllRows}
                allRowsSelected={props.allRowsSelected}
              />
            )}
          <TasksTable history={history} {...props} openModal={openModal} />
        </React.Fragment>
      </PageLayout>
    </div>
  );
};

TasksTablePage.propTypes = {
  allRowsSelected: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  perPage: PropTypes.number,

  selectAllRows: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  getBreadcrumbs: PropTypes.func,
  actionName: PropTypes.string,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  history: PropTypes.object.isRequired,
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  parentTaskID: PropTypes.string,
  createHeader: PropTypes.func,
  modalID: PropTypes.string,
  openModalAction: PropTypes.func.isRequired,
  showSelectAll: PropTypes.bool,
  unselectAllRows: PropTypes.func.isRequired,
  reloadPage: PropTypes.func.isRequired,
  permissions: PropTypes.shape({
    edit: PropTypes.bool,
  }),
};

TasksTablePage.defaultProps = {
  perPage: 20,
  allRowsSelected: false,
  getBreadcrumbs: () => null,
  actionName: '',
  status: STATUS.PENDING,
  selectedRows: [],
  parentTaskID: null,
  createHeader: () => __('Tasks'),
  showSelectAll: false,
  modalID: '',
  permissions: {
    edit: false,
  },
};

export default TasksTablePage;

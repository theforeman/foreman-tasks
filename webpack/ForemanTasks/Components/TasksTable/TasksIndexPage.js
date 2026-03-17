import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import URI from 'urijs';
import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Button,
  Spinner,
  PageSection,
} from '@patternfly/react-core';
import { RedoIcon } from '@patternfly/react-icons';

import SelectAllCheckbox from 'foremanReact/components/PF4/TableIndexPage/Table/SelectAllCheckbox';
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import { STATUS } from 'foremanReact/constants';
import { useBulkSelect } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';
import { getPageStats } from 'foremanReact/components/PF4/TableIndexPage/Table/helpers';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as __ } from 'foremanReact/common/I18n';
import { useForemanPermissions } from 'foremanReact/Root/Context/ForemanContext';
import { getURIQuery } from 'foremanReact/common/helpers';

import { getCSVurl, getApiPathname } from './TasksTableHelpers';
import { convertDashboardQuery } from '../TaskActions/TaskActionHelpers';
import {
  TASKS_API_KEY,
  CANCEL_MODAL,
  RESUME_MODAL,
  FORCE_UNLOCK_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  FORCE_UNLOCK_SELECTED_MODAL,
  TASKS_SEARCH_PROPS,
} from './TasksTableConstants';
import { columns, getRowKebabItems } from './TasksColumns';
import TasksModals from './TasksModals';
import { ActionSelectButton } from './Components/ActionSelectButton';
import { fetchTasksSummary } from '../TasksDashboard/TasksDashboardActions';
import TasksDashboard from '../TasksDashboard';

const TasksTableIndexPage = ({ match, history }) => {
  const parentTaskID = match.params.id;
  const dispatch = useDispatch();
  const url = window.location.pathname + window.location.search;
  const uriQueryObject = getURIQuery(url);
  const apiUrl = useMemo(() => {
    const urlWithSearch = new URI(getApiPathname(url));
    urlWithSearch.addSearch({
      ...convertDashboardQuery(),
      include_permissions: true,
    });
    return urlWithSearch.toString();
    // convertDashboardQuery uses the url to get the query parameters, so we need to recompute it when the url changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const apiResponse = useAPI('get', apiUrl, {
    key: TASKS_API_KEY,
  });

  const { status, setAPIOptions } = apiResponse;
  const overrideSetAPIOptions = useCallback(
    newParams => {
      const { search, ...rest } = newParams;
      const newUrl = new URI(url);
      newUrl.addSearch({ search });
      setAPIOptions({
        params: {
          url: newUrl.toString(),
          ...rest,
        },
      });
    },
    [setAPIOptions, url]
  );

  const userPermissions = useForemanPermissions();
  const canEdit = userPermissions.has('edit_foreman_tasks');
  const [modalStates, setModalStates] = useState({
    [CANCEL_MODAL]: false,
    [RESUME_MODAL]: false,
    [FORCE_UNLOCK_MODAL]: false,
    [CANCEL_SELECTED_MODAL]: false,
    [RESUME_SELECTED_MODAL]: false,
    [FORCE_UNLOCK_SELECTED_MODAL]: false,
  });
  const openModal = id => {
    setModalStates(prev => ({
      ...prev,
      [id]: true,
    }));
  };
  const closeModal = id => {
    setModalStates(prev => ({
      ...prev,
      [id]: false,
    }));
  };
  const [clickedTask, setClickedTask] = useState(null);
  const rowKebabItems = getRowKebabItems(setClickedTask, openModal);
  const {
    search: apiSearchQuery,
    results,
    total,
    per_page: perPage,
    page,
    subtotal,
  } = apiResponse.response;

  const reloadPage = useCallback(() => {
    setAPIOptions({
      params: {
        page,
        per_page: perPage,
        search: convertDashboardQuery().search,
      },
    });

    dispatch(fetchTasksSummary(uriQueryObject.time, parentTaskID));
  }, [
    setAPIOptions,
    page,
    perPage,
    uriQueryObject.time,
    dispatch,
    parentTaskID,
  ]);
  const { pageRowCount } = getPageStats({ total, page, perPage });

  const {
    fetchBulkParams,
    searchQuery,
    updateSearchQuery,
    ...selectAllOptions
  } = useBulkSelect({
    results,
    metadata: { total, page, selectable: subtotal },
    initialSearchQuery: apiSearchQuery,
  });

  const {
    selectAll,
    selectPage,
    selectNone,
    selectedCount,
    selectOne,
    areAllRowsOnPageSelected,
    areAllRowsSelected,
    isSelected,
  } = selectAllOptions;

  const customToolbarItems = (
    <Toolbar ouiaId="tasks-table-toolbar">
      <ToolbarContent>
        <ToolbarGroup align={{ default: 'alignRight' }}>
          <ToolbarItem>
            <Button
              ouiaId="tasks-table-refresh-data"
              variant="primary"
              onClick={reloadPage}
              icon={<RedoIcon />}
            >
              {__('Refresh Data')}
            </Button>
          </ToolbarItem>
          {status === STATUS.PENDING && <Spinner size="lg" />}
          <ToolbarItem>
            <Button
              ouiaId="tasks-table-export-all"
              variant="secondary"
              component="a"
              href={getCSVurl()}
            >
              {__('Export All')}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
  const selectionToolbar = (
    <ToolbarItem key="selectAll">
      <SelectAllCheckbox
        {...{
          selectAll,
          selectPage,
          selectNone,
          selectedCount,
          pageRowCount,
        }}
        totalCount={total}
        areAllRowsOnPageSelected={areAllRowsOnPageSelected()}
        areAllRowsSelected={areAllRowsSelected()}
      />
    </ToolbarItem>
  );
  return (
    <>
      <TasksModals
        taskId={clickedTask?.id}
        taskName={clickedTask?.action}
        modalStates={modalStates}
        closeModal={closeModal}
        parentTaskID={parentTaskID}
        uriQuery={apiSearchQuery}
        selectAllOptions={selectAllOptions}
        reloadPage={reloadPage}
      />
      <TableIndexPage
        breadcrumbOptions={
          parentTaskID
            ? {
                breadcrumbItems: [
                  { caption: __('Tasks'), url: `/foreman_tasks/tasks` },
                  { caption: __('Sub tasks') },
                ],
              }
            : null
        }
        header={parentTaskID ? __('Sub tasks') : __('Tasks')}
        beforeToolbarComponent={
          <>
            <PageSection className="tasks-dashboard-section">
              <TasksDashboard history={history} parentTaskID={parentTaskID} />
            </PageSection>
            {customToolbarItems}
          </>
        }
        apiUrl=""
        apiOptions={{ key: TASKS_API_KEY }}
        controller="foreman_tasks/tasks"
        customSearchProps={TASKS_SEARCH_PROPS}
        columns={columns}
        rowKebabItems={rowKebabItems}
        creatable={false}
        showCheckboxes
        selectOne={selectOne}
        selectPage={selectPage}
        selectNone={selectNone}
        selectedCount={selectedCount}
        areAllRowsSelected={areAllRowsSelected}
        isSelected={isSelected}
        selectionToolbar={selectionToolbar}
        customToolbarItems={
          <ToolbarItem>
            <ActionSelectButton
              disabled={!canEdit || !(selectedCount || areAllRowsSelected())}
              onCancel={() => openModal(CANCEL_SELECTED_MODAL)}
              onResume={() => openModal(RESUME_SELECTED_MODAL)}
              onForceCancel={() => openModal(FORCE_UNLOCK_SELECTED_MODAL)}
            />
          </ToolbarItem>
        }
        replacementResponse={{
          ...apiResponse,
          setAPIOptions: overrideSetAPIOptions,
        }}
      />
    </>
  );
};

TasksTableIndexPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  history: PropTypes.object.isRequired,
};

TasksTableIndexPage.defaultProps = {
  match: {
    params: { id: null },
  },
};

export default TasksTableIndexPage;

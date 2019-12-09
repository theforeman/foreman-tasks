import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'foremanReact/components/common/table';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import { translate as __ } from 'foremanReact/common/I18n';
import Pagination from 'foremanReact/components/Pagination/PaginationWrapper';
import { getURIQuery } from 'foremanReact/common/helpers';
import createTasksTableSchema from './TasksTableSchema';
import { updateURlQuery } from './TasksTableHelpers';

const TasksTable = ({
  getTableItems,
  error,
  status,
  results,
  history,
  itemCount,
  pagination,
  selectedRows,
  selectAllRows,
  unselectAllRows,
  selectRow,
  unselectRow,
  openClickedModal,
  modalProps,
}) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);

  useEffect(() => {
    getTableItems(url);
  }, [getTableItems, url]);

  const getSelectionController = () => {
    const checkAllRowsSelected = () => results.length === selectedRows.length;
    return {
      allRowsSelected: () => checkAllRowsSelected(),
      selectAllRows: () => {
        if (checkAllRowsSelected()) unselectAllRows();
        else selectAllRows(results);
      },
      selectRow: ({ rowData: { id } }) => {
        if (selectedRows.includes(id)) unselectRow(id);
        else selectRow(id);
      },
      isSelected: ({ rowData }) => selectedRows.includes(rowData.id),
    };
  };

  if (status === STATUS.ERROR) {
    return (
      <MessageBox
        key="tasks-table-error"
        icontype="error-circle-o"
        msg={__(`Could not receive data: ${error && error.message}`)}
      />
    );
  }

  if (status === STATUS.PENDING && results.length === 0) {
    return <div />;
  }

  if (results.length === 0) {
    return <span>{__('No Tasks')}</span>;
  }

  const changeTablePage = ({ page, perPage }) => {
    updateURlQuery(
      {
        page,
        per_page: perPage,
      },
      history
    );
  };

  const setSortHistory = (by, order) => {
    updateURlQuery({ sort_by: by, sort_order: order }, history);
  };

  const taskActions = {
    cancelTask: (taskId, taskName) => {
      openClickedModal({
        taskId,
        taskName,
        setModalOpen: modalProps.cancelModal.setModalOpen,
      });
    },
    resumeTask: (taskId, taskName) => {
      openClickedModal({
        taskId,
        taskName,
        setModalOpen: modalProps.resumeModal.setModalOpen,
      });
    },
  };

  return (
    <div className="tasks-table">
      <Table
        key="tasks-table"
        columns={createTasksTableSchema(
          setSortHistory,
          uriQuery.sort_by,
          uriQuery.sort_order,
          taskActions,
          getSelectionController()
        )}
        rows={results}
      />
      <Pagination
        className="tasks-pagination"
        viewType="table"
        itemCount={itemCount}
        pagination={pagination}
        onChange={changeTablePage}
        dropdownButtonId="tasks-table-dropdown"
      />
    </div>
  );
};

TasksTable.propTypes = {
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  error: PropTypes.instanceOf(Error),
  itemCount: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
  }),
  history: PropTypes.object.isRequired,
  openClickedModal: PropTypes.func.isRequired,
  selectedRows: PropTypes.array,
  selectAllRows: PropTypes.func.isRequired,
  unselectAllRows: PropTypes.func.isRequired,
  selectRow: PropTypes.func.isRequired,
  unselectRow: PropTypes.func.isRequired,
  modalProps: PropTypes.shape({
    cancelSelectedModal: PropTypes.object,
    resumeSelectedModal: PropTypes.object,
    cancelModal: PropTypes.object,
    resumeModal: PropTypes.object,
  }).isRequired,
};

TasksTable.defaultProps = {
  status: STATUS.PENDING,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
  },
  selectedRows: [],
};

export default TasksTable;

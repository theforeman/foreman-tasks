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
  cancelTask,
  resumeTask,
  selectedRows,
  selectAllRows,
  unselectAllRows,
  selectRow,
  unselectRow,
  parentTaskID,
}) => {
  const url = history.location.pathname + history.location.search;
  const uriQuery = getURIQuery(url);

  useEffect(() => {
    getTableItems(url);
  }, [history.location.search]);

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
    cancel: (id, name) => {
      cancelTask(id, name, url, parentTaskID);
    },
    resume: (id, name) => {
      resumeTask(id, name, url, parentTaskID);
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
  cancelTask: PropTypes.func.isRequired,
  resumeTask: PropTypes.func.isRequired,
  selectedRows: PropTypes.array,
  selectAllRows: PropTypes.func.isRequired,
  unselectAllRows: PropTypes.func.isRequired,
  selectRow: PropTypes.func.isRequired,
  unselectRow: PropTypes.func.isRequired,
  parentTaskID: PropTypes.string,
};

TasksTable.defaultProps = {
  status: STATUS.PENDING,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
  },
  selectedRows: [],
  parentTaskID: null,
};

export default TasksTable;

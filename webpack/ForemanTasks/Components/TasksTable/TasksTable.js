import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'foremanReact/components/common/table';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import { translate as __ } from 'foremanReact/common/I18n';
import Pagination from 'foremanReact/components/Pagination/PaginationWrapper';
import createTasksTableSchema from './TasksTableSchema';

const TasksTable = ({
  getTableItems,
  error,
  status,
  results,
  query,
  itemCount,
  pagination,
  setSort,
  changeTablePage,
  sort,
}) => {
  useEffect(() => {
    getTableItems();
  }, [
    query.state,
    query.result,
    query.mode,
    query.time,
    pagination.page,
    pagination.perPage,
    sort.by,
    sort.order,
  ]);

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

  return (
    <div className="tasks-table">
      <Table
        key="tasks-table"
        columns={createTasksTableSchema(setSort, sort.by, sort.order)}
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
  setSort: PropTypes.func.isRequired,
  changeTablePage: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  query: PropTypes.shape({
    state: PropTypes.string,
    result: PropTypes.string,
    mode: PropTypes.string,
    time: PropTypes.string,
  }),
  error: PropTypes.instanceOf(Error),
  itemCount: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
  }),
  sort: PropTypes.shape({
    by: PropTypes.string,
    order: PropTypes.string,
  }).isRequired,
};

TasksTable.defaultProps = {
  status: STATUS.PENDING,
  query: {},
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
  },
};

export default TasksTable;

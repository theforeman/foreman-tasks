import React, { useEffect } from 'react';
import { Spinner } from 'patternfly-react';
import PropTypes from 'prop-types';
import { Table } from 'foremanReact/components/common/table';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import Pagination from 'foremanReact/components/Pagination/PaginationWrapper';
import createTasksTableSchema from './TasksTableSchema';

const TasksTable = ({
  getTableItems,
  sortBy,
  sortOrder,
  error,
  status,
  results,
  loading,
  itemCount,
  pagination,
  history,
  onPageChange,
}) => {
  useEffect(() => {
    getTableItems(getURIQuery(window.location.href));
  }, []);
  if (loading) {
    return <Spinner size="lg" loading />;
  }
  if (results.length === 0) {
    return <span>{__('No Tasks')}</span>;
  }

  if (status === STATUS.ERROR) {
    return (
      <MessageBox
        key="tasks-table-error"
        icontype="error-circle-o"
        msg={__(`Could not receive data: ${error && error.message}`)}
      />
    );
  }
  return (
    <div className="tasks-table">
      <Table
        key="tasks-table"
        columns={createTasksTableSchema(getTableItems, sortBy, sortOrder)}
        rows={results}
      />
      <Pagination
        className="tasks-pagination col-md-12"
        viewType="table"
        itemCount={itemCount}
        pagination={pagination}
        onChange={onPageChange(history)}
        dropdownButtonId="tasks-table-dropdown"
      />
    </div>
  );
};

TasksTable.propTypes = {
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  error: PropTypes.object,
  loading: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  pagination: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

TasksTable.defaultProps = {
  status: STATUS.PENDING,
  sortBy: '',
  sortOrder: '',
  error: null,
  loading: false,
};

export default TasksTable;

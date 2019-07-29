import React, { useEffect } from 'react';
import { Spinner } from 'patternfly-react';
import PropTypes from 'prop-types';
import { Table } from 'foremanReact/components/common/table';
import { STATUS } from 'foremanReact/constants';
import MessageBox from 'foremanReact/components/common/MessageBox';
import { translate as __ } from 'foremanReact/common/I18n';
import { getURIQuery } from 'foremanReact/common/helpers';
import Pagination from 'foremanReact/components/Pagination/PaginationWrapper';
import URI from 'urijs';
import createTasksTableSchema from './TasksTableSchema';
import './TasksTable.scss';

const TasksTable = ({
  getTableItems,
  error,
  status,
  results,
  loading,
  query,
  itemCount,
  pagination,
}) => {
  useEffect(() => {
    getTableItems();
  }, [query.state, query.result, query.mode, query.time]);
  const onPageChange = paginationArgs => {
    const uri = new URI(window.location.href);
    uri.setSearch({
      page: paginationArgs.page,
      per_page: paginationArgs.perPage,
    });
    window.history.pushState({ path: uri.toString() }, '', uri.toString());
    getTableItems();
  };

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

  const uriQuery = getURIQuery(window.location.href);
  return (
    <React.Fragment>
      <Table
        key="tasks-table"
        columns={createTasksTableSchema(
          getTableItems,
          uriQuery.sort_by,
          uriQuery.sort_order
        )}
        rows={results}
      />
      <Pagination
        className="tasks-pagination col-md-12"
        viewType="table"
        itemCount={itemCount}
        pagination={pagination}
        onChange={onPageChange}
        dropdownButtonId="tasks-table-dropdown"
      />
    </React.Fragment>
  );
};

TasksTable.propTypes = {
  results: PropTypes.array.isRequired,
  getTableItems: PropTypes.func.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUS)),
  query: PropTypes.shape(),
  error: PropTypes.object,
  loading: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
  }).isRequired,
};

TasksTable.defaultProps = {
  status: STATUS.PENDING,
  query: {},
  error: null,
  loading: false,
};

export default TasksTable;

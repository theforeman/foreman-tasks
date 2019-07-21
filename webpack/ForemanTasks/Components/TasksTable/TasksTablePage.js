import React from 'react';
import PropTypes from 'prop-types';
import { stringifyParams, changeQuery } from 'foremanReact/common/urlHelpers';
import SearchBar from 'foremanReact/components/SearchBar';
import PageLayout from 'foremanReact/pages/common/PageLayout/PageLayout';
import { Row, Col } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';
import TasksTable from './TasksTable';
import { TASKS_SEARCH_PROPS } from './TasksTableConstants';
import { ExportButton } from './Components/ExportButton';
import TasksDashboard from '../TasksDashboard';
import { getSearchURL } from './TasksTableHelpers';
import './TasksTablePage.scss';

const TasksTablePage = ({ ...props }) => {
  const onPageChange = historyObj => paginationArgs => {
    const search = {
      ...paginationArgs,
      ...props.searchLabels,
      searchQuery: props.search,
    };
    historyObj.push({
      pathname: historyObj.location.pathname,
      search: stringifyParams(search),
    });
    props.getTableItems({
      ...paginationArgs,
      ...props.searchLabels,
      search: props.search,
    });
  };

  const onSearch = (searchQuery, searchLabels = { ...props.searchLabels }) => {
    props.getTableItems({
      search: searchQuery.trim(),
      ...searchLabels,
      page: 1,
    });
  };

  const onBookmarkClick = searchQuery =>
    changeQuery({ search: searchQuery.trim(), page: 1 });

  return (
    <div className="tasks-table-page">
      <PageLayout header={__('Tasks')} searchable={false}>
        <TasksDashboard
          onSearch={searchLabels => onSearch(props.search, searchLabels)}
        />
        <Row>
          <Col xs={6}>
            <SearchBar
              data={TASKS_SEARCH_PROPS}
              initialQuery={props.search}
              onSearch={onSearch}
              onBookmarkClick={onBookmarkClick}
            />
          </Col>
          <Col xs={6}>
            <ExportButton
              url={getSearchURL('/foreman_tasks/tasks.csv', {
                search: props.search,
                ...props.searchLabels,
              })}
            />
          </Col>
        </Row>
        <TasksTable
          {...props}
          onPageChange={onPageChange}
          getTableItems={() =>
            props.getTableItems({
              search: props.search,
              ...props.searchLabels,
              page: props.pagination.page,
            })
          }
        />
      </PageLayout>
    </div>
  );
};

TasksTablePage.propTypes = {
  getTableItems: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  version: PropTypes.string,
  searchLabels: PropTypes.shape({}),
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    perPageOptions: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

TasksTablePage.defaultProps = {
  version: '',
  searchLabels: {},
};

export default TasksTablePage;

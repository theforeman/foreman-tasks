import URI from 'urijs';
import React from 'react';
import {
  column,
  sortableColumn,
  headerFormatterWithProps,
  cellFormatter,
} from 'foremanReact/components/common/table';
import { translate as __ } from 'foremanReact/common/I18n';

const headFormat = [headerFormatterWithProps];
const cellFormat = [cellFormatter];

const sortControllerFactory = (apiCall, sortBy, sortOrder) => ({
  apply: (by, order) => {
    const uri = new URI(window.location.href);
    uri.setSearch({ sort_by: by, sort_order: order });
    window.history.pushState({ path: uri.toString() }, '', uri.toString());
    apiCall();
  },
  property: sortBy,
  order: sortOrder,
});

const actionCellFormatter = url => (value, { rowData: { id } }) =>
  cellFormatter(<a href={`/${url}/${id}`}>{value}</a>);

/**
 * Generate a table schema to the Hardware Tasks page.
 * @param  {Function} apiCall a Redux async action that fetches and stores table data in Redux.
 *                            See TasksTableActions.
 * @param  {String}   by      by which column the table is sorted.
 *                            If none then set it to undefined/null.
 * @param  {String}   order   in what order to sort a column. If none then set it to undefined/null.
 *                            Otherwise, 'ASC' for ascending and 'DESC' for descending
 * @return {Array}
 */
const createTasksTableSchema = (apiCall, by, order) => {
  const sortController = sortControllerFactory(apiCall, by, order);
  return [
    column(
      'action',
      __('Action'),
      headFormat,
      [actionCellFormatter('foreman_tasks/tasks')],
      { className: 'col-md-4' }
    ),
    column('state', __('State'), headFormat, cellFormat, {
      className: 'col-md-1',
    }),
    column('result', __('Result'), headFormat, cellFormat, {
      className: 'col-md-1',
    }),
    sortableColumn('started_at', __('Started at'), 2, sortController),
    sortableColumn('ended_at', __('Ended at'), 2, sortController),
    column('username', __('User'), headFormat, cellFormat, {
      className: 'col-md-2',
    }),
  ];
};

export default createTasksTableSchema;

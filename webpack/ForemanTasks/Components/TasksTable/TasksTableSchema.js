import {
  column,
  sortableColumn,
  headerFormatterWithProps,
  cellFormatter,
} from 'foremanReact/components/common/table';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  dateCellFormmatter,
  actionCellFormatter,
  actionNameCellFormatter,
  durationCellFormmatter,
} from './TaskTableFormmatters';

const headFormat = [headerFormatterWithProps];
const cellFormat = [cellFormatter];

/**
 * Generate a table schema to the Hardware Tasks page.
 * @param  {Function} setSort          a Redux async action that sets new sort values
 * @param  {String}   by               by which column the table is sorted.
 *                                     If none then set it to undefined/null.
 * @param  {String}   order            in what order to sort a column. If none then set it to undefined/null.
 *                                     Otherwise, 'ASC' for ascending and 'DESC' for descending
 * @param  {function} cancelTask       A function to run when the cancel cell is clicked
 * @return {Array}
 */
const createTasksTableSchema = (setSort, by, order, taskActions) => {
  const sortController = {
    apply: setSort,
    property: by,
    order,
  };

  return [
    column(
      'action',
      __('Action'),
      headFormat,
      [actionNameCellFormatter('foreman_tasks/tasks')],
      { className: 'col-md-4' }
    ),
    column('state', __('State'), headFormat, cellFormat, {
      className: 'col-md-1',
    }),
    column('result', __('Result'), headFormat, cellFormat, {
      className: 'col-md-1',
    }),
    sortableColumn('started_at', __('Started at'), 3, sortController, [
      dateCellFormmatter,
    ]),
    sortableColumn('duration', __('Duration'), 3, sortController, [
      durationCellFormmatter,
    ]),
    column(
      'available_actions',
      __('Action'),
      headFormat,
      [actionCellFormatter(taskActions)],
      {
        className: 'col-md-1',
      }
    ),
  ];
};

export default createTasksTableSchema;

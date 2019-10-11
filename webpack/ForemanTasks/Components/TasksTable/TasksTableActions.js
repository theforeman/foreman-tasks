import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import {
  TASKS_TABLE_ID,
  TASKS_TABLE_SET_SORT,
  TASKS_TABLE_SET_PAGINATION,
} from './TasksTableConstants';
import { getApiPathname, updateURlQuery } from './TasksTableHelpers';

export const getTableItems = () =>
  getTableItemsAction(
    TASKS_TABLE_ID,
    getURIQuery(window.location.href),
    getApiPathname()
  );

export const setSort = (by, order) => {
  updateURlQuery({ sort_by: by, sort_order: order });
  return {
    type: TASKS_TABLE_SET_SORT,
    payload: { by, order },
  };
};

export const changeTablePage = ({ page, perPage }) => {
  updateURlQuery({
    page,
    per_page: perPage,
  });
  return {
    type: TASKS_TABLE_SET_PAGINATION,
    payload: { page, perPage },
  };
};

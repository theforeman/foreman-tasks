import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import { TASKS_TABLE_ID } from './TasksTableConstants';
import { getApiPathname } from './TasksTableHelpers';

export const getTableItems = url =>
  getTableItemsAction(TASKS_TABLE_ID, getURIQuery(url), getApiPathname(url));

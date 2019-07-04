import { getTableItemsAction } from 'foremanReact/components/common/table';
import { TASKS_TABLE_CONTROLLER } from './TasksTableConstants';

export const getTableItems = query =>
  getTableItemsAction(TASKS_TABLE_CONTROLLER, query, 'foreman_tasks');

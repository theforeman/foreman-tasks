import { getURIQuery } from 'foremanReact/common/helpers';
import { getTableItemsAction } from 'foremanReact/components/common/table';
import { TASKS_TABLE_CONTROLLER } from './TasksTableConstants';

export const getTableItems = () =>
  getTableItemsAction(
    TASKS_TABLE_CONTROLLER,
    getURIQuery(window.location.href),
    'foreman_tasks'
  );

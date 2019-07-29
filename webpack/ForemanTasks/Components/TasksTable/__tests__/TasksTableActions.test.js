import { TASKS_TABLE_ID } from '../TasksTableConstants';
import { getTableItems } from '../TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn(controller => controller),
}));

describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    expect(getTableItems('')).toEqual(TASKS_TABLE_ID);
  });
});

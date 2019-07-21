import { TASKS_TABLE_CONTROLLER } from './TasksTableConstants';
import { getTableItems } from './TasksTableActions';

jest.mock('foremanReact/components/common/table', () => ({
  getTableItemsAction: jest.fn((controller, query) => `${controller}-${query}`),
}));

describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    const query = 'some-query';

    expect(getTableItems(query)).toEqual(`${TASKS_TABLE_CONTROLLER}-${query}`);
  });
});

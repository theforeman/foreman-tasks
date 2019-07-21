import { getSearchURL } from '../TasksTableHelpers';

describe('TasksTable actions', () => {
  it('getTableItems should reuse common/table/getTableItemsAction', () => {
    const query = { key: 'value' };
    const path = 'url';
    expect(getSearchURL(path, query)).toEqual(
      'url?key=value&include_permissions=true'
    );
  });
});

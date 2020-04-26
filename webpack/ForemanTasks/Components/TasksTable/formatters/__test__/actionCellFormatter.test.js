import { actionCellFormatter } from '../actionCellFormatter';

describe('actionCellFormatter', () => {
  it('render', () => {
    const data = [
      { cancellable: false },
      { rowData: { action: 'some-name', id: 'some-id' } },
    ];
    expect(actionCellFormatter({})(...data)).toMatchSnapshot();
  });
});

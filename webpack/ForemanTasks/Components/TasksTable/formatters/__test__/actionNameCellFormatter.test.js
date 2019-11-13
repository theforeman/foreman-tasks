import { actionNameCellFormatter } from '../actionNameCellFormatter';

describe('actionNameCellFormatter', () => {
  it('render', () => {
    const data = ['action-name', { rowData: { id: 'some-id' } }];
    expect(actionNameCellFormatter('some-url')(...data)).toMatchSnapshot();
  });
});

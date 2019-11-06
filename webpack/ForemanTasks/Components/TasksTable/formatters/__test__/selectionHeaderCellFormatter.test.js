import selectionHeaderCellFormatter from '../selectionHeaderCellFormatter';

describe('selectionHeaderCellFormatter', () => {
  it('render', () => {
    expect(
      selectionHeaderCellFormatter(
        { allRowsSelected: () => true },
        'some-label'
      )
    ).toMatchSnapshot();
  });
});

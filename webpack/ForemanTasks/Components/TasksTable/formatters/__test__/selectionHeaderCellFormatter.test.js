import selectionHeaderCellFormatter from '../selectionHeaderCellFormatter';

describe('selectionHeaderCellFormatter', () => {
  it('render', () => {
    expect(
      selectionHeaderCellFormatter(
        { allPageSelected: () => true, permissions: { edit: true } },
        'some-label'
      )
    ).toMatchSnapshot();
  });
});

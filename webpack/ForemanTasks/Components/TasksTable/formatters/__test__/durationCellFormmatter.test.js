import { durationCellFormmatter } from '../durationCellFormmatter';

describe('durationCellFormmatter', () => {
  it('render with tooltip', () => {
    expect(
      durationCellFormmatter({ text: 'some-value', tooltip: 'some-tooltip' })
    ).toMatchSnapshot();
  });
  it('render without tooltip', () => {
    expect(durationCellFormmatter({ text: 'some-value' })).toMatchSnapshot();
  });
});

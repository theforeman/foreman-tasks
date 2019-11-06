import { dateCellFormmatter } from '../dateCellFormmatter';

describe('dateCellFormmatter', () => {
  it('render', () => {
    expect(dateCellFormmatter('some-value')).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import TasksTablePage from '../TasksTablePage';

const props = {
  search: '',
  getTableItems: jest.fn(),
  pagination: {},
  results: [],
  itemCount: 1,
  history: {},
  onPageChange: jest.fn(),
};
describe('TasksTablePage', () => {
  it('should render', () => {
    const component = shallow(<TasksTablePage {...props} />);
    expect(component).toMatchSnapshot();
  });
});

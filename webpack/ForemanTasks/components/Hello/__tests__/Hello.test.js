import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Hello from '../index';

describe('Hello component', () => {
  it('rendering', () => {
    const wrapper = shallow(<Hello />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import Dependencies from '../Dependencies';

describe('Dependencies', () => {
  it('should render with no dependencies', () => {
    const wrapper = shallow(<Dependencies dependsOn={[]} blocks={[]} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
    expect(wrapper.find('DependencyList')).toHaveLength(2);
  });

  it('should render with depends_on dependencies', () => {
    const dependsOn = [
      { id: '123', action: 'Actions::FooBar', humanized: 'Foo Bar Action' },
      { id: '456', action: 'Actions::BazQux', humanized: 'Baz Qux Action' },
    ];
    const wrapper = shallow(<Dependencies dependsOn={dependsOn} blocks={[]} />);
    expect(
      wrapper
        .find('DependencyList')
        .at(0)
        .prop('tasks')
    ).toEqual(dependsOn);
  });

  it('should render with blocks dependencies', () => {
    const blocks = [
      { id: '789', action: 'Actions::Test', humanized: 'Test Action' },
    ];
    const wrapper = shallow(<Dependencies dependsOn={[]} blocks={blocks} />);
    expect(
      wrapper
        .find('DependencyList')
        .at(1)
        .prop('tasks')
    ).toEqual(blocks);
  });

  it('should render with both dependency types', () => {
    const dependsOn = [
      { id: '123', action: 'Actions::Foo', humanized: 'Foo Action' },
    ];
    const blocks = [
      { id: '456', action: 'Actions::Bar', humanized: 'Bar Action' },
      { id: '789', action: 'Actions::Baz', humanized: 'Baz Action' },
    ];
    const wrapper = shallow(
      <Dependencies dependsOn={dependsOn} blocks={blocks} />
    );
    expect(wrapper.find('DependencyList')).toHaveLength(2);
    expect(
      wrapper
        .find('DependencyList')
        .at(0)
        .prop('tasks')
    ).toEqual(dependsOn);
    expect(
      wrapper
        .find('DependencyList')
        .at(1)
        .prop('tasks')
    ).toEqual(blocks);
  });
});

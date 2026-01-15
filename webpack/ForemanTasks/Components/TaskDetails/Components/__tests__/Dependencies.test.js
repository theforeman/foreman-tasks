import React from 'react';
import { mount } from 'enzyme';
import Dependencies from '../Dependencies';

describe('Dependencies', () => {
  it('should render with no dependencies', () => {
    const wrapper = mount(<Dependencies dependsOn={[]} blocks={[]} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
    expect(wrapper.find('DependencyTable')).toHaveLength(2);
    expect(wrapper.find('Table')).toHaveLength(0);
    expect(wrapper.text()).toContain('None');
  });

  it('should render with depends_on dependencies', () => {
    const dependsOn = [
      {
        id: '123',
        action: 'Actions::FooBar',
        humanized: 'Foo Bar Action',
        state: 'stopped',
        result: 'success',
      },
      {
        id: '456',
        action: 'Actions::BazQux',
        humanized: 'Baz Qux Action',
        state: 'running',
        result: 'pending',
      },
    ];
    const wrapper = mount(<Dependencies dependsOn={dependsOn} blocks={[]} />);
    expect(wrapper.find('Table')).toHaveLength(1);
    expect(wrapper.find('Tbody').find('Tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('Foo Bar Action');
    expect(wrapper.text()).toContain('Baz Qux Action');
    expect(wrapper.text()).toContain('stopped');
    expect(wrapper.text()).toContain('success');
  });

  it('should render with blocks dependencies', () => {
    const blocks = [
      {
        id: '789',
        action: 'Actions::Test',
        humanized: 'Test Action',
        state: 'paused',
        result: 'warning',
      },
    ];
    const wrapper = mount(<Dependencies dependsOn={[]} blocks={blocks} />);
    expect(wrapper.find('Table')).toHaveLength(1);
    expect(wrapper.find('Tbody').find('Tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Test Action');
    expect(wrapper.text()).toContain('paused');
    expect(wrapper.text()).toContain('warning');
  });

  it('should render with both dependency types', () => {
    const dependsOn = [
      {
        id: '123',
        action: 'Actions::Foo',
        humanized: 'Foo Action',
        state: 'stopped',
        result: 'success',
      },
    ];
    const blocks = [
      {
        id: '456',
        action: 'Actions::Bar',
        humanized: 'Bar Action',
        state: 'running',
        result: 'pending',
      },
      {
        id: '789',
        action: 'Actions::Baz',
        humanized: 'Baz Action',
        state: 'stopped',
        result: 'error',
      },
    ];
    const wrapper = mount(
      <Dependencies dependsOn={dependsOn} blocks={blocks} />
    );
    expect(wrapper.find('Table')).toHaveLength(2);
    expect(wrapper.text()).toContain('Foo Action');
    expect(wrapper.text()).toContain('Bar Action');
    expect(wrapper.text()).toContain('Baz Action');
  });
});

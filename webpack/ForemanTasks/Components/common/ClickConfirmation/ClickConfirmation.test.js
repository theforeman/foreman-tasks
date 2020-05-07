import React from 'react';
import { testComponentSnapshotsWithFixtures, mount } from '@theforeman/test';
import { ClickConfirmation } from './';

const fixtures = {
  render: {
    title: 'some-title',
    body: 'some-body',
    confirmationMessage: 'some-message',
    id: 'some-id',
    path: 'some-path',
    confirmAction: 'some-confirm',
  },
};

describe('ClickConfirmation', () => {
  testComponentSnapshotsWithFixtures(ClickConfirmation, fixtures);
  it('click test', () => {
    const component = mount(<ClickConfirmation {...fixtures.render} />);
    const button = () => component.find('a').at(0);
    expect(button().hasClass('disabled')).toBeTruthy();
    const checkbox = component.find('input').at(0);
    checkbox.simulate('change', { target: { checked: true } });
    expect(button().hasClass('disabled')).toBeFalsy();
  });
});

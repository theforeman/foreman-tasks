import React from 'react';
import { testComponentSnapshotsWithFixtures, mount } from '@theforeman/test';
import { useForemanModal } from 'foremanReact/components/ForemanModal/ForemanModalHooks';
import { ClickConfirmation } from './';

const fixtures = {
  render: {
    title: 'some-title',
    confirmType: 'danger',
    body: 'some-body',
    confirmationMessage: 'some-message',
    id: 'some-id',
    confirmAction: 'some-confirm',
    onClick: jest.fn(),
  },
};

describe('ClickConfirmation', () => {
  testComponentSnapshotsWithFixtures(ClickConfirmation, fixtures);
  it('enable button on checkbox click', () => {
    const component = mount(<ClickConfirmation {...fixtures.render} />);
    const getButton = () => component.find('.confirm-button').at(0);
    expect(getButton().props().disabled).toBeTruthy();
    const checkbox = component.find('input').at(0);
    checkbox.simulate('change', { target: { checked: true } });
    expect(getButton().props().disabled).toBeFalsy();
  });

  it('click test', () => {
    const setModalClosed = jest.fn();
    useForemanModal.mockImplementation(id => ({
      setModalClosed: () => setModalClosed(id),
    }));
    const onClick = jest.fn();
    const props = { ...fixtures.render, onClick };
    const component = mount(<ClickConfirmation {...props} />);
    const getButton = () => component.find('.confirm-button').at(0);
    const checkbox = component.find('input').at(0);
    checkbox.simulate('change', { target: { checked: true } });
    getButton().simulate('click');
    expect(onClick).toBeCalled();
    expect(setModalClosed).toBeCalledWith({ id: fixtures.render.id });
  });
});

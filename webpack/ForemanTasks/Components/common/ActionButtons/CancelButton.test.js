import React from 'react';
import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import { shallow } from 'enzyme';
import { CancelButton } from './CancelButton';

const fixtures = {
  'render with minimal props': {
    id: 'some-id',
    name: 'some-name',
  },
};

describe('CancelButton', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(CancelButton, fixtures));
  describe('should use id and name on click', () => {
    const onClick = jest.fn();
    const id = 'some-id';
    const name = 'some-name';
    const component = shallow(
      <CancelButton id={id} name={name} onClick={onClick} />
    );
    component.find('Button').simulate('click');

    expect(onClick).toHaveBeenCalledWith(id, name);
  });
});

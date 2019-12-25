import React from 'react';
import { testComponentSnapshotsWithFixtures, shallow } from '@theforeman/test';

import { ResumeButton } from './ResumeButton';

const fixtures = {
  'render with minimal props': {
    id: 'some-id',
    name: 'some-name',
  },
};

describe('ResumeButton', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(ResumeButton, fixtures));
  describe('should use id and name on click', () => {
    const onClick = jest.fn();
    const id = 'some-id';
    const name = 'some-name';
    const component = shallow(
      <ResumeButton id={id} name={name} onClick={onClick} />
    );
    component.find('Button').simulate('click');

    expect(onClick).toHaveBeenCalledWith(id, name);
  });
});

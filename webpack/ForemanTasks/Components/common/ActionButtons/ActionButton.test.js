import React from 'react';
import { testComponentSnapshotsWithFixtures, shallow } from '@theforeman/test';

import { ActionButton } from './ActionButton';

const fixtures = {
  'render with cancellable true props': {
    availableActions: {
      cancellable: true,
      resumable: false,
    },
    taskActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
  'render with resumable true props': {
    availableActions: {
      cancellable: false,
      resumable: true,
    },
    taskActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
  'render with cancellable false props': {
    availableActions: {
      cancellable: false,
      resumable: false,
    },
    taskActions: {
      cancelTask: jest.fn(),
      resumeTask: jest.fn(),
    },
    id: 'id',
    name: 'some-name',
  },
};

describe('ActionButton', () => {
  describe('snapshot test', () =>
    testComponentSnapshotsWithFixtures(ActionButton, fixtures));
  describe('click test', () => {
    const resumeTask = jest.fn();
    const cancelTask = jest.fn();
    const id = 'some-id';
    const name = 'some-name';
    const taskActions = { resumeTask, cancelTask };
    it('cancel', () => {
      const component = shallow(
        <ActionButton
          id={id}
          name={name}
          availableActions={{ cancellable: true }}
          taskActions={taskActions}
        />
      ).children();
      component.props().buttons[0].action.onClick();
      expect(cancelTask).toHaveBeenCalledWith(id, name);
    });
    it('resume', () => {
      const component = shallow(
        <ActionButton
          id={id}
          name={name}
          availableActions={{ resumable: true }}
          taskActions={taskActions}
        />
      ).children();

      component.props().buttons[0].action.onClick();
      expect(resumeTask).toHaveBeenCalledWith(id, name);
    });
  });
});

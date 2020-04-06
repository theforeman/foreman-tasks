import React from 'react';
import { testComponentSnapshotsWithFixtures, shallow } from '@theforeman/test';

import { ActionButton } from './ActionButton';

const resumeTask = jest.fn();
const cancelTask = jest.fn();
const forceCancelTask = jest.fn();
const taskActions = { resumeTask, cancelTask, forceCancelTask };
const minProps = { canEdit: true, id: 'id', name: 'some-name' };
const fixtures = {
  'render with cancellable true props': {
    availableActions: {
      cancellable: true,
      resumable: false,
    },
    taskActions,
    ...minProps,
  },
  'render with resumable true props': {
    availableActions: {
      cancellable: false,
      resumable: true,
    },
    taskActions,
    ...minProps,
  },
  'render with stoppable and cancellable true props': {
    availableActions: {
      cancellable: true,
      stoppable: true,
    },
    taskActions,
    ...minProps,
  },
  'render with cancellable false props': {
    availableActions: {
      cancellable: false,
      resumable: false,
    },
    taskActions,
    ...minProps,
  },
  'render with canEdit false': {
    availableActions: {
      cancellable: false,
      resumable: false,
    },
    taskActions,
    ...minProps,
    canEdit: false,
  },
};

describe('ActionButton', () => {
  describe('snapshot test', () =>
    testComponentSnapshotsWithFixtures(ActionButton, fixtures));
  describe('click test', () => {
    const id = 'some-id';
    const name = 'some-name';
    it('cancel', () => {
      const component = shallow(
        <ActionButton
          id={id}
          name={name}
          canEdit
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
          canEdit
          availableActions={{ resumable: true }}
          taskActions={taskActions}
        />
      ).children();
      component.props().buttons[0].action.onClick();
      expect(resumeTask).toHaveBeenCalledWith(id, name);
    });
    it('force cancel', () => {
      const component = shallow(
        <ActionButton
          id={id}
          name={name}
          canEdit
          availableActions={{ stoppable: true }}
          taskActions={taskActions}
        />
      ).children();
      component.props().buttons[0].action.onClick();
      expect(cancelTask).toHaveBeenCalledWith(id, name);
    });
  });
});

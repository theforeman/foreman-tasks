import { testSelectorsSnapshotWithFixtures } from '@theforeman/test';
import {
  selectActionText,
  selectActionState,
  selectActionType,
} from '../ConfirmModalSelectors';

const state = {
  foremanTasks: {
    confirmModal: {
      actionText: 'some-text',
      actionState: 'some-state',
      actionType: 'some-type',
    },
  },
};

const fixtures = {
  'should select actionText': () => selectActionText(state),
  'should select actionState': () => selectActionState(state),
  'should select actionType': () => selectActionType(state),
};

describe('TasksDashboard - Selectors', () =>
  testSelectorsSnapshotWithFixtures(fixtures));

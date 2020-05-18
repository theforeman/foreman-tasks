import { testReducerSnapshotWithFixtures } from '@theforeman/test';
import {
  UPDATE_MODAL,
  CANCEL_MODAL,
  RESUME_SELECTED_MODAL,
} from '../../../TasksTableConstants';

import reducer from '../ConfirmModalReducer';

const fixtures = {
  'should return the initial state': {},
  'should handle UPDATE_MODAL to cancel': {
    action: {
      type: UPDATE_MODAL,
      payload: { modalID: CANCEL_MODAL },
    },
  },
  'should handle UPDATE_MODAL to resume': {
    action: {
      type: UPDATE_MODAL,
      payload: { modalID: RESUME_SELECTED_MODAL },
    },
  },
};

describe('ConfirmModalReducer reducer', () =>
  testReducerSnapshotWithFixtures(reducer, fixtures));

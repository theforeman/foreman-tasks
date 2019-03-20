import Immutable from 'seamless-immutable';
import {
  FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS,
  FOREMAN_TASK_DETAILS_STOP_PULLING,
  FOREMAN_TASK_DETAILS_START_PULLING,
  FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL,
  FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL,
} from './TaskDetailsConstants';

const initialState = Immutable({});

export default (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case FOREMAN_TASK_DETAILS_FETCH_TASK_SUCCESS:
      return state.merge({
        ...payload,
      });
    case FOREMAN_TASK_DETAILS_STOP_PULLING:
      if (payload.timeoutId) {
        clearTimeout(payload.timeoutId);
      }
      return state.merge({ taskReload: false, timeoutId: null });
    case FOREMAN_TASK_DETAILS_START_PULLING:
      if (!payload.timeoutId) {
        payload.timeoutId = setInterval(
          () => payload.refetchTaskDetails(payload.id),
          5000
        );
      }
      return state.merge({ taskReload: true, timeoutId: payload.timeoutId });
    case FOREMAN_TASK_DETAILS_TOGGLE_UNLOCK_MODAL:
      return state.set('showUnlockModal', !state.showUnlockModal);
    case FOREMAN_TASK_DETAILS_TOGGLE_FORCE_UNLOCK_MODAL:
      return state.set('showForceUnlockModal', !state.showForceUnlockModal);
    default:
      return state;
  }
};

import Immutable from 'seamless-immutable';
import {
  UPDATE_MODAL,
  CANCEL_SELECTED_MODAL,
  RESUME_SELECTED_MODAL,
  RESUME_MODAL,
  CANCEL_MODAL,
} from '../../TasksTableConstants';

const initialState = Immutable({});

export const ConfirmModalReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_MODAL:
      switch (payload.modalID) {
        case CANCEL_SELECTED_MODAL:
        case CANCEL_MODAL:
          return state.merge({
            actionText: 'cancel',
            actionState: 'stopped',
            actionType: payload.modalID,
          });
        case RESUME_SELECTED_MODAL:
        case RESUME_MODAL:
          return state.merge({
            actionText: 'resume',
            actionState: 'running',
            actionType: payload.modalID,
          });
        default:
          return state.set('actionType', payload.modalID);
      }
    default:
      return state;
  }
};
export default ConfirmModalReducer;

import Immutable from 'seamless-immutable';
import { FOREMAN_TASK_DETAILS_SUCCESS } from './TaskDetailsConstants';

const initialState = Immutable({ isData: false });

export default (state = initialState, { type }) => {
  switch (type) {
    case FOREMAN_TASK_DETAILS_SUCCESS:
      return state.set('isData', true);
    default:
      return state;
  }
};

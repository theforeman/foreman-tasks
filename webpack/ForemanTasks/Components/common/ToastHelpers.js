import { addToast } from 'foremanReact/redux/actions/toasts';

export const dispatchToast = (dispatch, params) => {
  dispatch(addToast(params));
};

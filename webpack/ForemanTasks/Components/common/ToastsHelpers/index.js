import { TOAST_TYPES } from './ToastTypesConstants';

export const successToastData = message => ({
  type: TOAST_TYPES.SUCCESS,
  message,
});
export const errorToastData = message => ({ type: TOAST_TYPES.ERROR, message });
export const warningToastData = message => ({
  type: TOAST_TYPES.WARNING,
  message,
});
export const infoToastData = message => ({
  type: TOAST_TYPES.INFO,
  message,
});

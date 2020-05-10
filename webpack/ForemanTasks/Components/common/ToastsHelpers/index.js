import { TOAST_TYPES } from './ToastTypesConstants';

export const successToastData = text => ({ type: TOAST_TYPES.SUCCESS, text });
export const errorToastData = text => ({ type: TOAST_TYPES.ERROR, text });
export const warningToastData = text => ({ type: TOAST_TYPES.WARNING, text });

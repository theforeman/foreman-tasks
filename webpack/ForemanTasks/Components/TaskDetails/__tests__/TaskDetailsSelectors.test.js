import { STATUS } from 'foremanReact/constants';

import { FOREMAN_TASK_DETAILS } from '../TaskDetailsConstants';
import {
  selectAPIError,
  selectAPIErrorCode,
  selectAPIErrorMessage,
} from '../TaskDetailsSelectors';

const axiosErrorWithApiBody = {
  message: 'Request failed with status code 404',
  response: {
    status: 404,
    data: {
      error: {
        message: 'Task not found',
      },
    },
  },
};

const plainError = {
  message: 'Network Error',
};

const forbiddenError = {
  message: 'Request failed with status code 403',
  response: {
    status: 403,
    data: {
      error: {
        message: 'Forbidden',
      },
    },
  },
};

const buildState = (response, status = STATUS.ERROR) => ({
  API: {
    [FOREMAN_TASK_DETAILS]: {
      payload: {},
      response,
      status,
    },
  },
});

describe('TaskDetailsSelectors - API error selectors', () => {
  it('selectAPIError returns null when API status is not ERROR', () => {
    expect(selectAPIError(buildState({}, STATUS.RESOLVED))).toBeNull();
  });

  it('selectAPIError returns the stored response when API status is ERROR', () => {
    expect(selectAPIError(buildState(plainError))).toEqual(plainError);
  });

  it('selectAPIErrorMessage prefers the API error body message', () => {
    expect(
      selectAPIErrorMessage(buildState(axiosErrorWithApiBody))
    ).toBe('Task not found');
  });

  it('selectAPIErrorMessage falls back to the top-level error message', () => {
    expect(selectAPIErrorMessage(buildState(plainError))).toBe('Network Error');
  });

  it('selectAPIErrorMessage returns undefined when there is no API error', () => {
    expect(
      selectAPIErrorMessage(buildState({}, STATUS.RESOLVED))
    ).toBeUndefined();
  });

  it('selectAPIErrorCode returns the HTTP status from the error response', () => {
    expect(selectAPIErrorCode(buildState(axiosErrorWithApiBody))).toBe(404);
    expect(selectAPIErrorCode(buildState(forbiddenError))).toBe(403);
  });

  it('selectAPIErrorCode returns undefined when the error response has no status', () => {
    expect(selectAPIErrorCode(buildState(plainError))).toBeUndefined();
  });
});

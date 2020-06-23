export const API = {
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

export const get = data => ({ type: 'some-type', ...data });

import { STATUS } from 'foremanReact/constants';

export default {
  'render with minimal Props': {
    results: ['a'],
    getTableItems: jest.fn(),
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
  },
  'render with no results': {
    results: [],
    getTableItems: jest.fn(),
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
  },
  'render with error Props': {
    results: ['a'],
    status: STATUS.ERROR,
    getTableItems: jest.fn(),
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
  },
  'render with loading Props': {
    results: ['a'],
    loading: true,
    getTableItems: jest.fn(),
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
  },
};

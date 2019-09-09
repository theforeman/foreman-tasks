import { STATUS } from 'foremanReact/constants';

export const minProps = {
  getTableItems: jest.fn(),
  getBreadcrumbs: jest.fn(),
  itemCount: 2,
  cancelTaskAction: jest.fn(),
  pagination: {
    page: 1,
    perPage: 10,
  },
  history: { location: { search: '' } },
  location: { pathname: '' },
  status: STATUS.RESOLVED,
  results: ['a', 'b'],
  sort: {
    by: 'q',
    order: 'w',
  },
};

export default {
  'render with minimal Props': {
    ...minProps,
  },
  'render with no results': {
    ...minProps,
    results: [],
    status: STATUS.RESOLVED,
  },
  'render with error Props': {
    ...minProps,
    results: ['a'],
    status: STATUS.ERROR,
  },
  'render with loading Props': {
    ...minProps,
    results: ['a'],
    status: STATUS.PENDING,
  },
};

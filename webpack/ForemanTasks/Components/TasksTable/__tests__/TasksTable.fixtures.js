import { STATUS } from 'foremanReact/constants';

export const minProps = {
  getTableItems: jest.fn(),
  getBreadcrumbs: jest.fn(),
  itemCount: 2,
  selectPage: jest.fn(),
  selectAllRows: jest.fn(),
  unselectAllRows: jest.fn(),
  selectRow: jest.fn(),
  unselectRow: jest.fn(),
  selectedRows: [],
  pagination: {
    page: 1,
    perPage: 10,
  },
  history: { location: { search: '' } },
  results: ['a', 'b'],
  sort: {
    by: 'q',
    order: 'w',
  },
  openClickedModal: jest.fn(),
  openModalAction: jest.fn(),
  openModal: jest.fn(),
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

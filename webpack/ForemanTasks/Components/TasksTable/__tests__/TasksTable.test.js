import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import { STATUS } from 'foremanReact/constants';
import TasksTable from '../TasksTable';

const actions = {
  getTableItems: jest.fn(),
  setSort: jest.fn(),
  changeTablePage: jest.fn(),
};

const fixtures = {
  'render with minimal Props': {
    ...actions,
    status: STATUS.RESOLVED,
    results: ['a'],
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
    sort: {
      by: 'q',
      order: 'w',
    },
  },
  'render with no results': {
    ...actions,
    results: [],
    status: STATUS.RESOLVED,
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
    sort: {
      by: 'q',
      order: 'w',
    },
  },
  'render with error Props': {
    ...actions,
    results: ['a'],
    status: STATUS.ERROR,
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
    sort: {
      by: 'q',
      order: 'w',
    },
  },
  'render with loading Props': {
    ...actions,
    results: ['a'],
    status: STATUS.PENDING,
    itemCount: 0,
    pagination: {
      page: 1,
      perPage: 10,
    },
    sort: {
      by: 'q',
      order: 'w',
    },
  },
};

jest.mock('../TasksTableSchema');
describe('TasksTable', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksTable, fixtures));
});

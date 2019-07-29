import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import TasksTable from '../TasksTable';
import fixtures from './TasksTable.fixtures';

jest.mock('../TasksTableSchema');
describe('TasksTable', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksTable, fixtures));
});

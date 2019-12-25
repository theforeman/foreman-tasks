import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import TasksTable from '../TasksTable';
import fixtures from './TasksTable.fixtures';

jest.mock('../TasksTableSchema');
describe('TasksTable', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksTable, fixtures));
});

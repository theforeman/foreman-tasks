import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import TasksTableWrapper from '../TasksTableWrapper';
import fixtures from './TasksTable.fixtures';

const firstFixture = {
  [Object.keys(fixtures)[0]]: fixtures[Object.keys(fixtures)[0]],
};

describe('TasksTableWrapper', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksTableWrapper, firstFixture));
});

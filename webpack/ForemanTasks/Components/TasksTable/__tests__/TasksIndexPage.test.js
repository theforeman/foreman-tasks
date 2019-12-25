import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import { TasksIndexPage } from '../TasksIndexPage';
import { minProps } from './TasksTable.fixtures';

const fixtures = {
  'render with minimal props': minProps,
};

describe('TasksIndexPage', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksIndexPage, fixtures));
});

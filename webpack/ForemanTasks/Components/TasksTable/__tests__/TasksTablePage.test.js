import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import TasksTablePage from '../TasksTablePage';
import { minProps } from './TasksTable.fixtures';

const fixtures = {
  'render with minimal props': minProps,

  'render with Breadcrubs': {
    ...minProps,
    getBreadcrumbs: () => ({
      breadcrumbItems: [
        { caption: 'Tasks', url: `/foreman_tasks/tasks` },
        {
          caption: 'action Name',
          url: `/foreman_tasks/tasks/someid`,
        },
        { caption: 'Sub tasks' },
      ],
    }),
  },
};

describe('TasksTablePage', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TasksTablePage, fixtures));
});

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';
import TasksTablePage from '../TasksTablePage';
import { minProps } from './TasksTable.fixtures';

jest.mock('foremanReact/common/helpers', () => ({
  getURIQuery: () => ({ state: 'stopped' }),
}));

const history = {
  location: { pathname: '/foreman_tasks/tasks', search: '?action="some-name"' },
};
const fixtures = {
  'render with minimal props': { ...minProps, history },

  'render with Breadcrubs and edit permissions': {
    ...minProps,
    history,
    results: [{ action: 'a', canEdit: true }],
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

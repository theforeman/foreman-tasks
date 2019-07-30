import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';
import { SubTasksPage } from '../SubTasksPage';
import { minProps } from './TasksTable.fixtures';

const fixtures = {
  'render with minimal props': {
    ...minProps,

    match: {
      params: {
        id: 'some-id',
      },
    },
  },
};

describe('SubTasksPage', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(SubTasksPage, fixtures));
});

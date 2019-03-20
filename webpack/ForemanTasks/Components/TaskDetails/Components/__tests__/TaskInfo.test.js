import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import TaskInfo from '../TaskInfo';

const fixtures = {
  'render without Props': { id: 'test' },
  'render with Props': {
    id: 'test',
    startAt: '2019-06-17 16:04:09 +0300',
    label: 'Actions::Katello::EventQueue::Monitor',
    pending: true,
    action: 'Monitor Event Queue',
    username: 'admin',
    startedAt: '2019-06-17 16:04:09 +0300',
    endedAt: null,
    state: 'paused',
    result: 'error',
    progress: 0.5,
    input: {
      locale: 'en',
      current_request_id: null,
      current_timezone: 'Asia/Jerusalem',
      current_user_id: 4,
      current_organization_id: null,
      current_location_id: null,
    },
    output: {},
    humanized: {
      action: 'Monitor Event Queue',
      input: '',
      output: '',
      errors: [
        'Action Actions::Katello::EventQueue::Monitor is already active',
      ],
    },
    cli_example: null,
    executionPlan: {
      state: 'paused',
      cancellable: false,
    },
    help:
      "A paused task represents a process that has not finished properly. Any task in paused state can lead to potential inconsistency and needs to be resolved.\nThe recommended approach is to investigate the error messages below and in 'errors' tab, address the primary cause of the issue and resume the task.",
    hasSubTasks: false,
    allowDangerousActions: false,
    locks: [
      {
        name: 'task_owner',
        exclusive: false,
        resource_type: 'User',
        resource_id: 4,
      },
    ],
    username_path: '<a href="/users/4-admin/edit">admin</a>',
  },
};

describe('TaskInfo', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(TaskInfo, fixtures));
});

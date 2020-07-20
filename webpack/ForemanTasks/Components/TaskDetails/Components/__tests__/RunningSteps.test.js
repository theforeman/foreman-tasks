import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import RunningSteps from '../RunningSteps';

const minProps = {
  id: 'task-id1',
  taskReload: true,
  cancelStep: jest.fn(),
  taskReloadStart: jest.fn(),
};
const fixtures = {
  'render with min Props': minProps,
  'render with Props': {
    ...minProps,
    executionPlan: {
      state: 'paused',
      cancellable: false,
    },
    runningSteps: [
      {
        cancellable: false,
        id: 1,
        action_class: 'test',
        state: 'paused',
        input:
          '{"locale"=>"en",\n "current_request_id"=>nil,\n "current_user_id"=>4,\n "current_organization_id"=>nil,\n "current_location_id"=>nil}\n',
        output: '{}\n',
      },
    ],
  },
};

describe('RunningSteps', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(RunningSteps, fixtures));
});

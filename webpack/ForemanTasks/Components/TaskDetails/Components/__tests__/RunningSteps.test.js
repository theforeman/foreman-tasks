import { testComponentSnapshotsWithFixtures } from 'react-redux-test-utils';

import RunningSteps from '../RunningSteps';

const fixtures = {
  'render without Props': {},
  'render with Props': {
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

import { testComponentSnapshotsWithFixtures } from '@theforeman/test';

import Errors from '../Errors';

const fixtures = {
  'render without Props': {},
  'render with Props': {
    executionPlan: {
      state: 'paused',
      cancellable: false,
    },
    failedSteps: [
      {
        error: {
          exception_class: 'RuntimeError',
          message:
            'Action Actions::Katello::EventQueue::Monitor is already active',
          backtrace: [
            "/home/vagrant/.gem/ruby/gems/dynflow-1.2.3/lib/dynflow/action/singleton.rb:15:in `rescue in singleton_lock!'",
            "/home/vagrant/.gem/ruby/gems/dynflow-1.2.3/lib/dynflow/action/singleton.rb:12:in `singleton_lock!'",
          ],
        },
        action_class: 'Actions::Katello::EventQueue::Monitor',
        state: 'error',
        input:
          '{"locale"=>"en",\n "current_request_id"=>nil,\n "current_user_id"=>4,\n "current_organization_id"=>nil,\n "current_location_id"=>nil}\n',
        output: '{}\n',
      },
    ],
  },
};

describe('Errors', () => {
  describe('rendering', () =>
    testComponentSnapshotsWithFixtures(Errors, fixtures));
});

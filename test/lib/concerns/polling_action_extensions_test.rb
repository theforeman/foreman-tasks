require 'foreman_tasks_test_helper'

module ForemanTasks
  module Concerns
    class PollingActionExtensionsTest < ::ActiveSupport::TestCase
      class Action < ::Dynflow::Action
        include ::Dynflow::Action::Polling
      end

      describe 'polling interval tuning' do
        let(:default_intervals) { [0.5, 1, 2, 4, 8, 16] }

        it 'is extends the polling action module' do
          assert_equal ForemanTasks::Concerns::PollingActionExtensions, ::Dynflow::Action::Polling.ancestors.first
        end

        it 'does not modify polling intervals by default' do
          assert_equal default_intervals, Action.allocate.poll_intervals
        end

        it 'cannot make intervals shorter than 0.5 seconds' do
          Setting.expects(:[]).with(:foreman_tasks_polling_multiplier).returns 0
          assert_equal default_intervals.map { 0.5 }, Action.allocate.poll_intervals
        end

        it 'can be used to make the intervals longer' do
          value = 5
          Setting.expects(:[]).with(:foreman_tasks_polling_multiplier).returns value
          assert_equal default_intervals.map { |i| i * value }, Action.allocate.poll_intervals
        end
      end
    end
  end
end

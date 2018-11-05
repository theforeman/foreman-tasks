require 'foreman_tasks_test_helper'

module Actions
  module Middleware
    class KeepCurrentTimezoneTest < ActiveSupport::TestCase
      include ::Dynflow::Testing

      class TestAction < Support::DummyDynflowAction
        middleware.use KeepCurrentTimezone

        def run; end
      end

      describe 'plan' do
        let(:zone) { Time.find_zone('Pacific/Honolulu') }
        test 'with current user set' do
          Time.expects(:zone).returns(zone)
          action = create_and_plan_action(TestAction)
          assert_equal(zone.name, action.input['current_timezone'])
        end
      end

      describe 'run' do
        let(:zone) { Time.find_zone('Pacific/Honolulu') }

        before do
          @real_zone = Time.zone
          @action = create_and_plan_action(TestAction)
        end

        test 'when timezone is not set in input' do
          # It saves and restore the real zone
          Time.expects(:zone=).with(@real_zone)
          @action.stubs(:input).returns({})
          run_action(@action)
        end

        test 'with current timezone as input' do
          # We plan the @action in @real_zone
          # We run the action in Pacific/Honolulu
          Time.stubs(:zone).returns(zone)
          # It restores the orinal time zone
          Time.expects(:zone=).with(zone)

          # It restores the saved time zone
          Time.expects(:zone=).with(@real_zone)
          run_action(@action)
        end
      end
    end
  end
end

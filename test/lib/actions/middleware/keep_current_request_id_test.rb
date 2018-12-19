require 'foreman_tasks_test_helper'

module ForemanTasks
  class KeepCurrentRequestIDTest < ActiveSupport::TestCase
    class DummyAction < Actions::EntryAction
      middleware.use ::Actions::Middleware::KeepCurrentRequestID

      def plan(plan = false)
        plan_self if plan
      end

      def run
        output[:run_result] = ::Logging.mdc['request']
      end

      def finalize
        output[:finalize_result] = ::Logging.mdc['request']
      end
    end

    describe Actions::Middleware::KeepCurrentRequestID do
      include ::Dynflow::Testing

      before { @old_id = ::Logging.mdc['request'] }
      after  { ::Logging.mdc['request'] = @old_id }

      let(:expected_id) { 'an_id' }

      it 'stores the id on planning' do
        ::Logging.mdc['request'] = expected_id
        action = create_and_plan_action(DummyAction)
        action.input[:current_request_id].must_equal expected_id
      end

      it 'restores the id for run' do
        ::Logging.mdc['request'] = expected_id
        action = create_and_plan_action(DummyAction, true)
        action = run_action action
        action.output[:run_result].must_equal expected_id
      end

      it 'restores the id for finalize' do
        ::Logging.mdc['request'] = expected_id
        action = create_and_plan_action(DummyAction, true)
        action = finalize_action(run_action(action))
        action.output[:finalize_result].must_equal expected_id
      end
    end
  end
end

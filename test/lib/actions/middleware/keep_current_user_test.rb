require 'foreman_tasks_test_helper'

module Actions
  module Middleware
    class KeepCurrentUserTest < ActiveSupport::TestCase
      include ::Dynflow::Testing

      class TestAction < Support::DummyDynflowAction
        middleware.use KeepCurrentUser

        def run; end
      end

      class TestHookAction < Support::DummyDynflowAction
        middleware.use KeepCurrentUser
        execution_plan_hooks.use :null_hook, :on => :planning

        def null_hook; end
      end

      before do
        @user = mock('user')
        @user.stubs(:id).returns(1)
      end

      describe 'hook' do
        test 'does not reset current user before planning' do
          triggered = ForemanTasks.trigger(TestHookAction)
          task = ForemanTasks::Task.where(:external_id => triggered.id).first
          wait_for { task.reload.state == 'stopped' }

          assert_equal(User.current.id, task.execution_plan.entry_action.input['current_user_id'])
        end
      end

      describe 'plan' do
        test 'with current user set' do
          User.expects(:current).twice.returns(@user)

          @action = create_and_plan_action(TestAction)
          assert_equal(@user.id, @action.input['current_user_id'])
        end
      end

      describe 'run' do
        before do
          User.stubs(:current).returns(@user)

          @action = create_and_plan_action(TestAction)

          User.stubs(:current)
        end

        test 'with current user as input' do
          User.unscoped.class.any_instance.expects(:find).with(@user.id).returns(@user)

          User.expects(:current=).with(@user)

          User.stubs(:current=).with(nil)

          @action = run_action(@action)
        end
      end
    end
  end
end

require 'foreman_tasks_test_helper'
require 'foreman_tasks/test_helpers'

module ForemanTasks
  class ActionWithSubPlansTest < ActiveSupport::TestCase
    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    # to be able to use the locking
    ::User.include ForemanTasks::Concerns::ActionSubject

    class ParentAction < Actions::ActionWithSubPlans
      def plan(user)
        action_subject(user)
        plan_self(user_id: user.id)
      end

      def create_sub_plans
        user = User.find(input[:user_id])
        trigger(ChildAction, user)
      end

      def total_count
        1
      end
    end

    class ChildAction < Actions::EntryAction
      def plan(user)
        action_subject(user)
        plan_self(user_id: user.id)
      end

      def run; end
    end

    describe Actions::ActionWithSubPlans do
      include ForemanTasks::TestHelpers::WithInThreadExecutor

      let(:user) { FactoryBot.create(:user) }

      let(:task) do
        triggered = ForemanTasks.trigger(ParentAction, user)
        raise triggered.error if triggered.respond_to?(:error)
        triggered.finished.wait(30)
        ForemanTasks::Task.where(:external_id => triggered.id).first
      end

      specify 'the sub-plan stores the information about its parent' do
        _(task.sub_tasks.size).must_equal 1
        _(task.sub_tasks.first.label).must_equal ChildAction.name
      end

      specify "the locks of the sub-plan don't colide with the locks of its parent" do
        child_task = task.sub_tasks.first
        assert_not(child_task.locks.any?, "the lock is ensured by the parent")
        found = ForemanTasks::Link.for_resource(user).where(:task_id => child_task.id).any?
        assert(found, "the action is linked properly")
      end
    end
  end
end

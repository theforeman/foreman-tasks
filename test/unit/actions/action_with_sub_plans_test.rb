require "foreman_tasks_test_helper"

module ForemanTasks
  class ActionWithSubPlansTest <  ActiveSupport::TestCase
    self.use_transactional_fixtures = false

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    # to be able to use the locking
    class ::User < User.parent
      include ForemanTasks::Concerns::ActionSubject
    end

    class ParentAction < Actions::ActionWithSubPlans
      def plan(user)
        action_subject(user)
        plan_self(user_id: user.id)
      end

      def create_sub_plans
        user = User.find(input[:user_id])
        trigger(ChildAction, user)
      end
    end

    class ChildAction < Actions::EntryAction
      def plan(user)
        action_subject(user)
        plan_self(user_id: user.id)
      end
      def run
      end
    end

    describe Actions::ActionWithSubPlans do
      let(:task) do
        user = FactoryGirl.create(:user)
        triggered = ForemanTasks.trigger(ParentAction, user)
        raise triggered.error if triggered.respond_to?(:error)
        triggered.finished.wait(2)
        ForemanTasks::Task.where(:external_id => triggered.id).first
      end

      specify "the sub-plan stores the information about its parent" do
        task.sub_tasks.size.must_equal 1
        task.sub_tasks.first.label.must_equal ChildAction.name
      end

      specify "the locks of the sub-plan don't colide with the locks of its parent" do
        child_task = task.sub_tasks.first
        assert(child_task.locks.any? { |lock| lock.name == 'write' }, "it's locks don't conflict with parent's")
      end
    end

  end
end

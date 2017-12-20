require 'foreman_tasks_test_helper'

module ForemanTasks
  class TaskGroupsTest < ActiveSupport::TestCase
    self.use_transactional_fixtures = false
    include ::Dynflow::Testing

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    after do
      ::ForemanTasks::TaskGroup.all.each(&:destroy)
      ::ForemanTasks::Task::DynflowTask.all.each(&:destroy)
    end

    class ParentAction < Actions::ActionWithSubPlans
      middleware.use ::Actions::Middleware::InheritTaskGroups

      def plan(count)
        task_group = ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup.new
        task_group.id = 1
        task_group.save!
        task.add_missing_task_groups(task_group)
        plan_self :count => count
      end

      def create_sub_plans
        Array.new(input[:count]) { |i| trigger InheritingChildAction, i + 2 }
      end
    end

    class ChildAction < Actions::EntryAction
      def plan(number = 1)
        task_group = ::ForemanTasks::TaskGroups::RecurringLogicTaskGroup.new
        task_group.id = number
        task_group.save!
        task.add_missing_task_groups task_group
        input[:id] = task_group.id
      end
    end

    class InheritingChildAction < ChildAction
      middleware.use ::Actions::Middleware::InheritTaskGroups
    end

    describe ForemanTasks::TaskGroup do
      let(:spawn_task) do
        lambda do |action_class, *args|
          triggered = ForemanTasks.trigger(action_class, *args)
          raise triggered.error if triggered.respond_to?(:error)
          triggered.finished.wait
          ForemanTasks::Task.where(:external_id => triggered.id).first
        end
      end

      it 'has the task group assigned' do
        task = spawn_task.call ChildAction
        task.task_groups.map(&:id).must_equal [1]
      end

      it 'tasks inherit task groups correctly' do
        children_count = 3
        task = spawn_task.call ParentAction, children_count
        # Parent task has task groups of its children
        task.task_groups.map(&:id).sort.must_equal [1, 2, 3, 4]
        # Children have the parent's and their own, they don't have their siblings' task groups
        task.sub_tasks.count.must_equal children_count
        task.sub_tasks.each do |sub_task|
          sub_task.task_groups.map(&:id).sort.must_equal [1, sub_task.input[:id]].sort
        end
      end
    end
  end
end

require 'foreman_tasks_test_helper'

module ForemanTasks
  class ChainingTest < ActiveSupport::TestCase
    include ForemanTasks::TestHelpers::WithInThreadExecutor

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    it 'creates a scheduled task chained to a prerequisite execution plan' do
      prerequisite_plan = ForemanTasks.dynflow.world.plan(Support::DummyDynflowAction)

      task = ForemanTasks.chain(prerequisite_plan.id, Support::DummyDynflowAction)

      assert_kind_of ForemanTasks::Task::DynflowTask, task
      assert_predicate task, :scheduled?

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, prerequisite_plan.id
    end

    it 'accepts multiple prerequisite execution plans' do
      prerequisite_plan_1 = ForemanTasks.dynflow.world.plan(Support::DummyDynflowAction)
      prerequisite_plan_2 = ForemanTasks.dynflow.world.plan(Support::DummyDynflowAction)

      task = ForemanTasks.chain([prerequisite_plan_1.id, prerequisite_plan_2.id], Support::DummyDynflowAction)

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, prerequisite_plan_1.id
      assert_includes dependencies, prerequisite_plan_2.id
    end
  end
end


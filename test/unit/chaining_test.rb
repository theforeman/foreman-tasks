require 'foreman_tasks_test_helper'

module ForemanTasks
  class ChainingTest < ActiveSupport::TestCase
    include ForemanTasks::TestHelpers::WithInThreadExecutor

    before do
      User.current = User.where(:login => 'apiadmin').first
    end

    it 'creates a scheduled task chained to a dependency task' do
      triggered = ForemanTasks.trigger(Support::DummyDynflowAction)
      triggered.finished.wait(30)
      dependency_task = ForemanTasks::Task::DynflowTask.find_by!(:external_id => triggered.id)

      task = ForemanTasks.chain(dependency_task, Support::DummyDynflowAction)

      assert_kind_of ForemanTasks::Task::DynflowTask, task
      assert_predicate task, :scheduled?

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, dependency_task.external_id
    end

    it 'accepts multiple dependency tasks' do
      triggered_1 = ForemanTasks.trigger(Support::DummyDynflowAction)
      triggered_2 = ForemanTasks.trigger(Support::DummyDynflowAction)
      triggered_1.finished.wait(30)
      triggered_2.finished.wait(30)
      dependency_task_1 = ForemanTasks::Task::DynflowTask.find_by!(:external_id => triggered_1.id)
      dependency_task_2 = ForemanTasks::Task::DynflowTask.find_by!(:external_id => triggered_2.id)

      task = ForemanTasks.chain([dependency_task_1, dependency_task_2], Support::DummyDynflowAction)

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, dependency_task_1.external_id
      assert_includes dependencies, dependency_task_2.external_id
    end

    it 'accepts dependency task objects' do
      triggered = ForemanTasks.trigger(Support::DummyDynflowAction)
      triggered.finished.wait(30)
      dependency_task = ForemanTasks::Task::DynflowTask.find_by!(:external_id => triggered.id)

      task = ForemanTasks.chain(dependency_task, Support::DummyDynflowAction)

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, dependency_task.external_id
    end

    it 'accepts dependency tasks as a relation' do
      triggered = ForemanTasks.trigger(Support::DummyDynflowAction)
      triggered.finished.wait(30)
      dependency_task = ForemanTasks::Task::DynflowTask.find_by!(:external_id => triggered.id)

      task = ForemanTasks.chain(ForemanTasks::Task::DynflowTask.where(:id => dependency_task.id), Support::DummyDynflowAction)

      dependencies = ForemanTasks.dynflow.world.persistence.find_execution_plan_dependencies(task.execution_plan.id)
      assert_includes dependencies, dependency_task.external_id
    end
  end
end

require 'foreman_tasks/version'
require 'foreman_tasks/task_error'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'
require 'foreman_tasks/triggers'
require 'foreman_tasks/authorizer_ext'
require 'foreman_tasks/widget_manager'

module ForemanTasks
  extend Algebrick::TypeCheck
  extend Algebrick::Matching

  def self.dynflow
    @dynflow ||= ForemanTasks::Dynflow.new
  end

  def self.trigger(action, *args, &block)
    dynflow.world.trigger action, *args, &block
  end

  def self.trigger_task(async, action, *args, &block)
    Match! async, true, false

    match trigger(action, *args, &block),
          (on ::Dynflow::World::PlaningFailed.(error: ~any) do |error|
            raise error
          end),
          (on ::Dynflow::World::Triggered.(execution_plan_id: ~any, future: ~any) do |id, finished|
            finished.wait if async == false
            ForemanTasks::Task::DynflowTask.find_by_external_id!(id)
          end)
  end

  def self.async_task(action, *args, &block)
    trigger_task true, action, *args, &block
  end

  def self.sync_task(action, *args, &block)
    trigger_task(false, action, *args, &block).tap do |task|
      raise TaskError.new(task) if task.execution_plan.error?
    end
  end
end

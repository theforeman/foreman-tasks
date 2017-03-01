require 'foreman_tasks/version'
require 'foreman_tasks/task_error'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'
require 'foreman_tasks/dynflow/configuration'
require 'foreman_tasks/triggers'
require 'foreman_tasks/authorizer_ext'
require 'foreman_tasks/cleaner'

module ForemanTasks
  extend Algebrick::TypeCheck
  extend Algebrick::Matching

  def self.dynflow
    @dynflow ||= ForemanTasks::Dynflow.new(nil, ForemanTasks::Dynflow::Configuration.new)
  end

  def self.trigger(action, *args, &block)
    dynflow.world.trigger action, *args, &block
  end

  def self.trigger_task(async, action, *args, &block)
    Match! async, true, false

    match trigger(action, *args, &block),
          (on ::Dynflow::World::PlaningFailed.call(error: ~any) do |error|
            raise error
          end),
          (on ::Dynflow::World::Triggered.call(execution_plan_id: ~any, future: ~any) do |id, finished|
            finished.wait if async == false
            ForemanTasks::Task::DynflowTask.where(:external_id => id).first!
          end)
  end

  def self.async_task(action, *args, &block)
    trigger_task true, action, *args, &block
  end

  def self.sync_task(action, *args, &block)
    trigger_task(false, action, *args, &block).tap do |task|
      raise TaskError, task if task.execution_plan.error? || task.execution_plan.result == :warning
    end
  end

  def self.delay(action, delay_options, *args)
    result = dynflow.world.delay action, delay_options, *args
    ForemanTasks::Task::DynflowTask.where(:external_id => result.id).first!
  end
end

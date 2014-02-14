require 'foreman_tasks/version'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'
require 'foreman_tasks/triggers'

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
          (on ::Dynflow::World::PlaningFailed.(error: ~any) |
                  ::Dynflow::World::ExecutionFailed.(error: ~any) do |error|
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
    # TODO raise aggregation error when there are failed run-steps
    trigger_task false, action, *args, &block
  end

end

require 'foreman_tasks/version'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'
require 'foreman_tasks/triggers'

module ForemanTasks
  extend Algebrick::TypeCheck

  def self.dynflow
    @dynflow ||= ForemanTasks::Dynflow.new
  end

  def self.trigger(action, *args, &block)
    dynflow.world.trigger action, *args, &block
  end

  def self.trigger_task(async, action, *args, &block)
    Match! async, true, false

    run = trigger(action, *args, &block)
    run.finished.wait if async == false
    ForemanTasks::Task::DynflowTask.find_by_external_id!(run.id)
  end

  def self.async_task(action, *args, &block)
    trigger_task true, action, *args, &block
  end

  def self.sync_task(action, *args, &block)
    # TODO raise aggregation error when there are failed run-steps
    trigger_task false, action, *args, &block
  end

end

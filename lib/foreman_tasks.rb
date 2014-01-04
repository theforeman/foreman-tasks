require 'foreman_tasks/version'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'

module ForemanTasks

  def self.dynflow
    @dynflow ||= ForemanTasks::Dynflow.new
  end

  def self.trigger(action, *args, &block)
    dynflow.world.trigger action, *args, &block
  end

  def self.async_task(action, *args, &block)
    run = trigger(action, *args, &block)
    ForemanTasks::Task::DynflowTask.find_by_external_id(run.id)
  end

end

require 'foreman_tasks/version'
require 'foreman_tasks/task_error'
require 'foreman_tasks/engine'
require 'foreman_tasks/dynflow'
require 'foreman_tasks/dynflow/configuration'
require 'foreman_tasks/triggers'
require 'foreman_tasks/authorizer_ext'
require 'foreman_tasks/cleaner'
require 'foreman_tasks/continuous_output'

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
    rails_safe_trigger_task do
      Match! async, true, false
      match trigger(action, *args, &block),
            (on ::Dynflow::World::PlaningFailed.call(error: ~any) do |error|
              raise error
            end),
            (on ::Dynflow::World::Triggered.call(execution_plan_id: ~any, future: ~any) do |id, finished|
              unless async
                timeout = Setting['foreman_tasks_sync_task_timeout']
                finished.wait(timeout)
                task = ForemanTasks::Task::DynflowTask.where(:external_id => id).first
                if task.nil? || (!task.paused? && task.pending?)
                  raise TimeoutError, "The time waiting for task #{task.try(:id)} to finish exceeded the 'foreman_tasks_sync_task_timeout' (#{timeout}s)"
                end
              end
              task || ForemanTasks::Task::DynflowTask.where(:external_id => id).first!
            end)
    end
  end

  def self.rails_safe_trigger_task
    ActiveSupport::Dependencies.interlock.permit_concurrent_loads do
      yield
    end
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

  def self.register_scheduled_task(task_class, cronline)
    ForemanTasks::RecurringLogic.transaction(isolation: :serializable) do
      return if ForemanTasks::RecurringLogic.joins(:tasks)
                                            .where(state: 'active')
                                            .merge(ForemanTasks::Task.where(label: task_class.name))
                                            .exists?

      User.as_anonymous_admin do
        recurring_logic = ForemanTasks::RecurringLogic.new_from_cronline(cronline)
        recurring_logic.save!
        recurring_logic.start(task_class)
      end
    end
  rescue ActiveRecord::TransactionIsolationError # rubocop:disable Lint/SuppressedException
  end
end

# The goal of ForemanTasksCore is to collect parts of foreman-tasks
# that can be shared by the Foreman server and Foreman proxy

require 'foreman_tasks_core/settings_loader'
require 'foreman_tasks_core/otp_manager'
require 'foreman_tasks_core/ticker'
require 'foreman_tasks_core/batch_action'
require 'foreman_tasks_core/batch_callback_action'
require 'foreman_tasks_core/batch_runner_action'
require 'foreman_tasks_core/output_collector_action'
require 'foreman_tasks_core/single_runner_batch_action'
require 'foreman_tasks_core/task_launcher'

module ForemanTasksCore
  def self.dynflow_world
    raise 'Dynflow world not set. Call initialize first' unless @dynflow_world
    @dynflow_world
  end

  def self.dynflow_present?
    defined? Dynflow
  end

  def self.dynflow_setup(dynflow_world)
    @dynflow_world = dynflow_world
  end

  def self.silent_dead_letter_matchers
    [::Dynflow::DeadLetterSilencer::Matcher.new(ForemanTasksCore::Ticker)]
  end
end

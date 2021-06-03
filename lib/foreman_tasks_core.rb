# The goal of ForemanTasksCore is to collect parts of foreman-tasks
# that can be shared by the Foreman server and Foreman proxy
#
require 'foreman_tasks_core/runner'
require 'smart_proxy_dynflow/task_launcher'
require 'smart_proxy_dynflow/ticker'
require 'smart_proxy_dynflow/settings_loader'

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

  TaskLauncher = Proxy::Dynflow::TaskLauncher
  Ticker = Proxy::Dynflow::Ticker
  SettingsLoader = Proxy::Dynflow::SettingsLoader
end

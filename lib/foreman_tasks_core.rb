# The goal of ForemanTasksCore is to collect parts of foreman-tasks
# that can be shared by the Foreman server and Foreman proxy
#
require 'smart_proxy_dynflow'
require 'smart_proxy_dynflow/task_launcher'
require 'smart_proxy_dynflow/settings_loader'
require 'smart_proxy_dynflow/otp_manager'

require 'foreman_tasks_core/runner'

module ForemanTasksCore
  def self.dynflow_world
    Proxy::Dynflow::Core.world
  end

  def self.dynflow_present?
    true
  end

  def self.dynflow_setup(_dynflow_world); end

  TaskLauncher = Proxy::Dynflow::TaskLauncher
  SettingsLoader = Proxy::Dynflow::SettingsLoader
  OtpManager = Proxy::Dynflow::OtpManager
end

# Require foreman's lib directory which contains foreman/dynflow/configuration
lib_foreman = File.expand_path('lib/foreman', Rails.root)
require lib_foreman if Dir.exist?(lib_foreman)
require 'foreman_tasks/dynflow/persistence'

module ForemanTasks
  # Import all Dynflow configuration from Foreman, and add our own for Tasks
  class Dynflow::Configuration < ::Foreman::Dynflow::Configuration
    def initialize_persistence
      ForemanTasks::Dynflow::Persistence.new(default_sequel_adapter_options)
    end
  end
end

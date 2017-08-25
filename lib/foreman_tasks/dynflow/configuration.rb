# Require foreman's lib directory which contains foreman/dynflow/configuration
lib_foreman = File.expand_path('lib/foreman', Rails.root)
require lib_foreman if Dir.exist?(lib_foreman)
require 'foreman_tasks/dynflow/persistence'

module ForemanTasks
  # Import all Dynflow configuration from Foreman, and add our own for Tasks
  class Dynflow::Configuration < ::Foreman::Dynflow::Configuration
    def world_config
      super.tap do |config|
        config.backup_deleted_plans = backup_settings[:backup_deleted_plans]
        config.backup_dir           = backup_settings[:backup_dir]
      end
    end

    def backup_settings
      backup_options = {
        :backup_deleted_plans => true,
        :backup_dir => default_backup_dir
      }
      settings = SETTINGS[:'foreman-tasks'] && SETTINGS[:'foreman-tasks'][:backup]
      backup_options.merge!(settings) if settings
      backup_options
    end

    def default_backup_dir
      File.join(Rails.root, 'tmp', 'task-backup')
    end

    def initialize_persistence
      ForemanTasks::Dynflow::Persistence.new(default_sequel_adapter_options)
    end
  end
end

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
      return @backup_settings if @backup_settings
      backup_options = {
        :backup_deleted_plans => true,
        :backup_dir => default_backup_dir
      }
      settings = SETTINGS[:'foreman-tasks'] && SETTINGS[:'foreman-tasks'][:backup]
      backup_options.merge!(settings) if settings
      env_var = ENV['TASK_BACKUP']
      unless env_var.nil?
        backup_options[:backup_deleted_plans] = environment_override(env_var)
      end
      @backup_settings = backup_options
    end

    def default_backup_dir
      File.join(Rails.root, 'tmp', 'task-backup')
    end

    def environment_override(env_var)
      # Everything except 0, n, no, false is considered to be a truthy value
      !%w[0 n no false].include?(env_var.downcase)
    end

    def initialize_persistence
      ForemanTasks::Dynflow::Persistence.new(default_sequel_adapter_options)
    end
  end
end

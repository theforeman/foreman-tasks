namespace :foreman_tasks do
  namespace :cleanup do
    desc <<DESC
Clean tasks based on filter and age. ENV variables:

  * TASK_SEARCH : scoped search filter (example: 'label = "Actions::Foreman::Host::ImportFacts"')
  * AFTER       : delete tasks created after *AFTER* period. Expected format is a number followed by the time unit (s,h,m,y), such as '10d' for 10 days
  * STATES      : comma separated list of task states to touch with the cleanup, by default only stopped tasks are covered
  * NOOP        : set to "true" if the task should not actuall perform the deletion
  * VERBOSE     : set to "true" for more verbose output
  * BATCH_SIZE  : the size of batches the tasks get processed in (1000 by default)

If none of TASK_SEARCH, BEFORE, STATES is specified, the tasks will be cleaned based
configuration in settings
DESC
    task :run => 'environment' do
      options = {}

      if ENV['TASK_SEARCH']
        options[:filter] = ENV['TASK_SEARCH']
      end

      if ENV['AFTER']
        options[:after] = ENV['AFTER']
      end

      if ENV['STATES']
        options[:states] = ENV['STATES'].to_s.split(',')
      end

      if ENV['NOOP']
        options[:noop] = true
      end

      if ENV['VERBOSE']
        options[:verbose] = true
      end

      if ENV['BATCH_SIZE']
        options[:batch_size] = ENV['BATCH_SIZE'].to_i
      end

      if ENV['FILTER']
        fail "FILTER has been deprecated. Please use TASK_SEARCH instead."
      end

      ForemanTasks::Cleaner.run(options)
    end

    desc 'Show the current configuration for auto-cleanup'
    task :config => 'environment' do
      if ForemanTasks::Cleaner.cleanup_settings[:after]
        puts _('The tasks will be deleted after %{after}') % ForemanTasks::Cleaner.cleanup_settings[:after]
      else
        puts _('Global period for cleaning up tasks is not set')
      end

      if ForemanTasks::Cleaner.actions_with_default_cleanup.empty?
        puts _('No actions are configured to be cleaned automatically')
      else
        puts _('The following actions are configured to be deleted automatically after some time:')
        printf("%-50s %s\n", _('name'), _('delete after'))
        ForemanTasks::Cleaner.actions_with_default_cleanup.each do |action, after|
          printf("%-50s %s\n", action.name, after)
        end
      end
    end
  end

  task :cleanup => 'cleanup:run'
end

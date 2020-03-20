namespace :foreman_tasks do
  namespace :cleanup do
    desc <<~DESC
      Clean tasks based on filter and age. ENV variables:

        * TASK_SEARCH : scoped search filter (example: 'label = "Actions::Foreman::Host::ImportFacts"')
        * AFTER       : delete tasks started after *AFTER* period. Expected format is a number followed by the time unit (s = seconds, m = minutes, h = hours, d = days, y = years), such as '10d' for 10 days
        * STATES      : comma separated list of task states to touch with the cleanup, by default only stopped tasks are covered, special value all can be used to clean the tasks, disregarding their states
        * NOOP        : set to "true" if the task should not actually perform the deletion
        * VERBOSE     : set to "true" for more verbose output
        * BATCH_SIZE  : the size of batches the tasks get processed in (1000 by default)
        * TASK_BACKUP : set to "true" or "false" to enable/disable task backup

      If TASK_SEARCH is set then AFTER, STATES can be set and it's used for cleanup. If TASK_SEARCH is not set then
      the cleanup respects the configuration file and setting AFTER or STATES will throw exception.
    DESC
    task :run => 'environment' do
      options = {}

      options[:filter] = ENV['TASK_SEARCH'] if ENV['TASK_SEARCH']

      options[:after] = ENV['AFTER'] if ENV['AFTER']

      options[:states] = ENV['STATES'].to_s.split(',') if ENV['STATES']
      options[:states] = [] if options[:states] == ['all']

      options[:noop] = true if ENV['NOOP']

      options[:verbose] = true if ENV['VERBOSE']

      options[:batch_size] = ENV['BATCH_SIZE'].to_i if ENV['BATCH_SIZE']

      if ENV['FILTER']
        raise 'FILTER has been deprecated. Please use TASK_SEARCH instead.'
      end

      ForemanTasks::Cleaner.run(options)
    end

    desc 'Show the current configuration for auto-cleanup'
    task :config => 'environment' do
      if ForemanTasks::Cleaner.cleanup_settings[:after]
        puts _('The tasks will be deleted after %{after}') % { :after => ForemanTasks::Cleaner.cleanup_settings[:after] }
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
      puts
      by_rules = ForemanTasks::Cleaner.actions_by_rules(ForemanTasks::Cleaner.actions_with_default_cleanup)
      if by_rules.empty?
        puts _('No cleanup rules are configured')
      else
        printf("%-50s %-15s %s\n", _('states'), _('delete after'), _('filter'))
        by_rules.each do |hash|
          state = case hash[:states]
                  when []
                    _('ANY')
                  when nil
                    'stopped'
                  else
                    hash[:states]
                  end
          printf("%-50s %-15s %s\n", state, hash[:after], hash[:filter])
        end
      end
    end
  end

  task :cleanup => 'cleanup:run'
end

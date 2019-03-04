module Actions
  module Try
    # A set of actions to try different scenarios with tasks in development.
    #
    # Usage:
    # from rails console, run:
    #
    #    # Successful task (ending in stopped state/success result)
    #    ForemanTasks.sync_task(Actions::Try::Success)
    #
    #    # Failing task task (ending in paused state/error result)
    #    ForemanTasks.sync_task(Actions::Try::Pause)
    #
    #    # Task that fails but resumes (ending in stopped state/warning result)
    #    ForemanTasks.sync_task(Actions::Try::Skip)
    unless Rails.env.production?
      class Success < Actions::EntryAction
        def plan
          plan_self(hello: 'world')
        end

        def run
        end
      end

      class Pause < Actions::EntryAction
        def plan
          plan_self(hello: 'world')
        end

        def run
          error! "This is an error"
        end
      end

      class Skip < Actions::EntryAction
        def plan
          plan_self(hello: 'world')
        end

        def run
          error! "This is an error, but will be skipped"
        end

        def rescue_strategy
          ::Dynflow::Action::Rescue::Skip
        end
      end
    end
  end
end

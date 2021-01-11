module Actions
  module Helpers
    module Lock
      # @see Lock.exclusive!
      def exclusive_lock!(resource)
        phase! Dynflow::Action::Plan
        parent_lock = ::ForemanTasks::Lock.for_resource(resource).where(:task_id => task.self_and_parents.map(&:id)).first
        if parent_lock
          ForemanTasks::Link.link_resource_and_related!(resource, task)
          parent_lock
        else
          ::ForemanTasks::Lock.exclusive!(resource, task)
        end
      end

      # @see Lock.lock!
      def lock!(resource, *_lock_names)
        Foreman::Deprecation.deprecation_warning('2.4', 'locking in foreman-tasks was reworked, please use a combination of exclusive_lock! and link! instead.')
        exclusive_lock!(resource)
      end

      # @see Lock.link!
      def link!(resource)
        phase! Dynflow::Action::Plan
        ::ForemanTasks::Link.link!(resource, task)
      end
    end
  end
end

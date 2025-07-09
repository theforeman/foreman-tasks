module Actions
  class BulkAction < Actions::ActionWithSubPlans
    # == Parameters:
    # actions_class::
    #   Class of action to trigger on targets
    # targets::
    #   Array of objects on which the action_class should be triggered
    # *args::
    #   Arguments that all the targets share
    def plan(action_class, targets, *args, concurrency_limit: nil, **kwargs)
      check_targets!(targets)
      extracted_concurrency_limit = extract_concurrency_limit(args, concurrency_limit)
      limit_concurrency_level!(extracted_concurrency_limit) if extracted_concurrency_limit
      plan_self(:action_class => action_class.to_s,
                :target_ids => targets.map(&:id),
                :target_class => targets.first.class.to_s,
                :args => args,
                :kwargs => kwargs)
    end

    def run(event = nil)
      super unless event == Dynflow::Action::Skip
    end

    def humanized_name
      with_sub_task { |t| t.humanized[:action] } || _('Bulk action')
    end

    def rescue_strategy
      Dynflow::Action::Rescue::Skip
    end

    def humanized_input
      with_sub_task do |a_sub_task|
        [a_sub_task.humanized[:action].to_s.downcase] +
          Array(a_sub_task.humanized[:input]) + ['...']
      end
    end

    # @api override when the logic for the initiation of the subtasks
    #      is different from the default one
    def create_sub_plans
      action_class = input[:action_class].constantize
      target_class = input[:target_class].constantize
      targets = target_class.unscoped.where(:id => current_batch)

      missing = Array.new((current_batch - targets.map(&:id)).count) { nil }

      args = input[:args]
      args += [input[:kwargs]] unless input[:kwargs].empty?

      (targets + missing).map do |target|
        trigger(action_class, target, *args)
      end
    end

    def check_targets!(targets)
      raise Foreman::Exception, N_('Empty bulk action') if targets.empty?
      if targets.map(&:class).uniq.length > 1
        raise Foreman::Exception, N_('The targets are of different types')
      end
    end

    def batch(from, size)
      input[:target_ids].slice(from, size)
    end

    def total_count
      input[:target_ids].count
    end

    private

    def extract_concurrency_limit(args = [], limit = nil)
      args.find { |arg| arg.is_a?(Hash) && arg.key?(:concurrency_limit) }&.fetch(:concurrency_limit) || limit
    end

    def with_sub_task
      sub_task = begin
        task.sub_tasks.first
      rescue ActiveRecord::RecordNotFound
        # #task raises if the action has no task linked to it
        # While it shouldn't happen, there's not much of a difference
        # between a action not having a task and an action having a
        # task but no sub tasks
      end
      yield sub_task if sub_task
    end
  end
end

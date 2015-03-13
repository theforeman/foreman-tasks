module Actions

  class BulkAction < Actions::ActionWithSubPlans
    # == Parameters:
    # actions_class::
    #   Class of action to trigger on targets
    # targets::
    #   Array of objects on which the action_class should be triggered
    # *args::
    #   Arguments that all the targets share
    def plan(action_class, targets, *args)
      check_targets!(targets)
      plan_self(:action_class => action_class.to_s,
                :target_ids => targets.map(&:id),
                :target_class => targets.first.class.to_s,
                :args => args)
    end

    def humanized_name
      if task.sub_tasks.first
         task.sub_tasks.first.humanized[:action]
      else
        _("Bulk action")
      end
    end

    def humanized_input
      a_sub_task = task.sub_tasks.first
      if a_sub_task
        [a_sub_task.humanized[:action].to_s.downcase] +
            Array(a_sub_task.humanized[:input]) + ['...']
      end
    end

    # @api override when the logic for the initiation of the subtasks
    #      is different from the default one
    def create_sub_plans
      action_class = input[:action_class].constantize
      target_class = input[:target_class].constantize
      targets = target_class.where(:id => input[:target_ids])

      targets.map do |target|
        trigger(action_class, target, *input[:args])
      end
    end

    def check_targets!(targets)
      if targets.empty?
        fail _("Empty bulk action")
      end
      if targets.map(&:class).uniq.length > 1
        fail _("The targets are of different types")
      end
    end

  end
end

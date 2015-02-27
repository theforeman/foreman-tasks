module Actions

  class BulkAction < Actions::EntryAction

    middleware.use Actions::Middleware::KeepCurrentUser

    SubPlanFinished = Algebrick.type do
      fields! :execution_plan_id => String,
              :success           => type { variants TrueClass, FalseClass }
    end

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

    def humanized_output
      return unless counts_set?
      _("%{total} tasks, %{success} success, %{failed} fail") %
          { total:   output[:total_count],
            success: output[:success_count],
            failed:  output[:failed_count] }
    end

    def run(event = nil)
      case(event)
      when nil
        if output[:total_count]
          resume
        else
          initiate_sub_plans
        end
      when SubPlanFinished
        mark_as_done(event.execution_plan_id, event.success)
        if done?
          check_for_errors!
        else
          suspend
        end
      end
    end

    # @api override when the logic for the initiation of the subtasks
    #      is different from the default one
    def create_sub_plans
      action_class = input[:action_class].constantize
      target_class = input[:target_class].constantize
      targets = target_class.where(:id => input[:target_ids])

      targets.map do |target|
        ForemanTasks.trigger(action_class, target, *input[:args])
      end
    end

    def initiate_sub_plans
      output.update(total_count: 0,
                    failed_count: 0,
                    success_count: 0)

      planned, failed = create_sub_plans.partition(&:planned?)

      sub_plan_ids = ((planned + failed).map(&:execution_plan_id))
      set_parent_task_id(sub_plan_ids)

      output[:total_count] = sub_plan_ids.size
      output[:failed_count] = failed.size

      if planned.any?
        wait_for_sub_plans(planned)
      else
        check_for_errors!
      end
    end

    def resume
      if task.sub_tasks.active.any?
        fail _("Some sub tasks are still not finished")
      end
    end

    def rescue_strategy
      Dynflow::Action::Rescue::Skip
    end

    def wait_for_sub_plans(plans)
      suspend do |suspended_action|
        plans.each do |plan|
          plan.finished.do_then do |value|
            suspended_action << SubPlanFinished[plan.execution_plan_id,
                                                value.result == :success]
          end
        end
      end
    end

    def mark_as_done(plan_id, success)
      if success
        output[:success_count] += 1
      else
        output[:failed_count] += 1
      end
    end

    def done?
      if counts_set?
        output[:total_count] - output[:success_count] - output[:failed_count] <= 0
      else
        false
      end
    end

    def run_progress
      if counts_set?
        (output[:success_count] + output[:failed_count]).to_f / output[:total_count]
      else
        0.1
      end
    end

    def counts_set?
      output[:total_count] && output[:success_count] && output[:failed_count]
    end

    def set_parent_task_id(sub_plan_ids)
      ForemanTasks::Task::DynflowTask.
          where(external_id: sub_plan_ids).
          update_all(parent_task_id: task.id)
    end

    def check_targets!(targets)
      if targets.empty?
        fail _("Empty bulk action")
      end
      if targets.map(&:class).uniq.length > 1
        fail _("The targets are of different types")
      end
    end

    def check_for_errors!
      fail _("A sub task failed") if output[:failed_count] > 0
    end

  end
end

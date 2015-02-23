module Actions

  class Actions::ActionWithSubPlans < Actions::EntryAction

    middleware.use Actions::Middleware::KeepCurrentUser

    SubPlanFinished = Algebrick.type do
      fields! :execution_plan_id => String,
              :success           => type { variants TrueClass, FalseClass }
    end

    def plan(*args)
      raise NotImplementedError
    end

    def run(event = nil)
      case(event)
      when nil
        if output[:total_count]
          resume
        else
          sub_plans = create_sub_plans
          sub_plans = Array[sub_plans] unless sub_plans.is_a? Array
          wait_for_sub_plans(sub_plans)
        end
      when SubPlanFinished
        mark_as_done(event.execution_plan_id, event.success)
        if done?
          check_for_errors!
          on_finish
        else
          suspend
        end
      end
    end

    # @api override when the logic for the initiation of the subtasks
    #      is different from the default one.
    # @returns a triggered task or array of triggered tasks
    # @example
    #
    #        def create_sub_plans
    #          trigger(MyAction, "Hello")
    #        end
    #
    # @example
    #
    #        def create_sub_plans
    #          [trigger(MyAction, "Hello 1"), trigger(MyAction, "Hello 2")]
    #        end
    #
    def create_sub_plans
      raise NotImplementedError
    end

    # @api method to be called after all the sub tasks finished
    def on_finish
    end

    def humanized_output
      return unless counts_set?
      _("%{total} tasks, %{success} success, %{failed} fail") %
          { total:   output[:total_count],
            success: output[:success_count],
            failed:  output[:failed_count] }
    end

    # Helper for creating sub plans
    def trigger(*args)
      ForemanTasks.trigger(*args)
    end

    def wait_for_sub_plans(sub_plans)
      output.update(total_count: 0,
                    failed_count: 0,
                    success_count: 0)

      planned, failed = sub_plans.partition(&:planned?)

      sub_plan_ids = ((planned + failed).map(&:execution_plan_id))
      set_parent_task_id(sub_plan_ids)

      output[:total_count] = sub_plan_ids.size
      output[:failed_count] = failed.size

      if planned.any?
        notify_on_finish(planned)
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

    def notify_on_finish(plans)
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
      if counts_set? && output[:total_count] > 0
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

module ForemanTasksCore
  class BatchAction < ::Dynflow::Action
    include Dynflow::Action::WithSubPlans
    include Dynflow::Action::WithPollingSubPlans

    # { task_id => { :action_class => Klass, :input => input } }
    def plan(launcher, input_hash)
      launcher.launch_children(self, input_hash)
      plan_self
    end

    def initiate
      ping suspended_action
      wait_for_sub_plans sub_plans
    end

    def rescue_strategy
      Dynflow::Action::Rescue::Fail
    end
  end
end

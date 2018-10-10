module ForemanTasksCore
  module Runner
    class ParentAction < ::Dynflow::Action
      include Dynflow::Action::WithSubPlans
      include Dynflow::Action::WithPollingSubPlans

      # { task_id => { :action_class => Klass, :input => input } }
      def plan(callback, input_hash)
        results = input_hash.reduce({}) do |acc, (key, value)|
          # This is ugly, but we need the IDs
          result = trigger(::Dynflow::Utils.constantize(value['action_class']),
                           value['action_input'].merge(:callback_host => callback))
          acc.merge(key => format_result(result))
        end
        plan_self :result => results
      end

      def initiate
        ping suspended_action
        wait_for_sub_plans sub_plans
      end

      private

      def format_result(result)
        if result.triggered?
          { :result => 'success', :task_id => result.execution_plan_id }
        else
          plan = world.persistence.load_execution_plan(result.id)
          { :result => 'error', :errors => plan.errors }
        end
      end
    end
  end
end

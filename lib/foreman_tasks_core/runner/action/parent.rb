module ForemanTasksCore
  module Runner
    class Action
      class Parent < ::Dynflow::Action
        include Dynflow::Action::WithSubPlans
        include Dynflow::Action::WithPollingSubPlans

        # { task_id => { :action_class => Klass, :input => input } }
        def plan(callback, input_hash)
          results = input_hash.reduce({}) do |acc, (key, value)|
            # This is ugly, but we need the IDs
            result = trigger(child_action_class(value),
                             value['action_input'].merge(:callback_host => callback))
            acc.merge(key => format_result(result))
          end
          if use_group_runner?
            trigger(group_runner_action_class, group_runner_input(results, input_hash))
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

        def child_action_class(value)
          if use_group_runner?
            ForemanTasksCore::Runner::Action::Dummy
          else
            ::Dynflow::Utils.constantize(value['action_class'])
          end
        end

        def group_runner_input(targets, input_hash)
          result = input_hash.reduce({}) do |acc, (key, value)|
            input = value['action_input']
            acc.merge(input['hostname'] => {
                :input => input,
                :run_step_id => 2,
                :execution_plan_id => targets[key][:task_id]
            })
          end
          { :targets => result }
        end

        def use_group_runner?
          !group_runner_action_class.nil?
        end

        def group_runner_action_class
          nil
        end
      end
    end
  end
end

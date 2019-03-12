require 'foreman_tasks_core/runner'

module ForemanTasksCore
  module TaskLauncher
    class AbstractGroup < Batch
      class GroupParentAction < ForemanTasksCore::TaskLauncher::ParentAction
        def plan(launcher, input_hash)
          launcher.launch_children(self, input_hash)
          sequence do
            results = plan_self
            plan_action BatchCallback, launcher.prepare_batch(input_hash), results.output[:results]
          end
        end

        def run(event = nil)
          super unless event == Dynflow::Action::Skip
        end

        def check_for_errors!(optional = true)
          super unless optional
        end

        def on_finish
          output[:results] = sub_plans.map(&:entry_action).reduce({}) do |acc, cur|
            acc.merge(cur.execution_plan_id => cur.output)
          end
        end

        def finalize
          output.delete(:results)
          check_for_errors!
        end

        def initiate
          ping suspended_action
          wait_for_sub_plans sub_plans
        end

        def rescue_strategy_for_self
          Dynflow::Action::Rescue::Skip
        end
      end

      class BatchCallback < ::Dynflow::Action
        def plan(input_hash, results)
          plan_self :targets => input_hash, :results => results
        end

        def run
          payload = format_payload(input['targets'], input['results'])
          SmartProxyDynflowCore::Callback::Request.new.callback({ :callbacks => payload }.to_json)
        end

        private

        def format_payload(input_hash, results)
          input_hash.map do |task_id, callback|
            { :callback => callback, :data => results[task_id] }
          end
        end
      end


      class Dummy < ::ForemanTasksCore::Runner::Action
        def init_run
          output[:result] = []
          suspend
        end
      end

      class GroupRunner < ::ForemanTasksCore::Runner::Action
        def plan(launcher, input)
          plan_self :targets => launcher.group_runner_input(input), :operation => launcher.operation
        end

        def initiate_runner
          launcher = SmartProxyDynflowCore::TaskLauncherRegistry.fetch(input[:operation])
          launcher.group_runner_class.new(input[:targets], suspended_action: suspended_action)
        end
      end

      def self.group_runner_class
        raise NotImplementedError
      end

      def launch!(input)
        trigger(nil, GroupParentAction, self, input)
      end

      def launch_children(parent, input_hash)
        super(parent, input_hash)
        trigger(parent, GroupRunner, self, input_hash)
      end

      def operation
        raise NotImplementedError
      end

      def group_runner_input(input)
        input.reduce({}) do |acc, (id, input)|
          input = { :execution_plan_id => results[id][:task_id],
                    :run_step_id => 2,
                    :input => input }
          acc.merge(id => input)
        end
      end

      private

      def child_launcher(parent)
        Single.new(world, callback, :parent => parent, :action_class_override => Dummy)
      end

      def transform_input(input)
        wipe_callback(input)
      end

      def wipe_callback(input)
        input.merge('action_input' => input['action_input'].merge('callback' => nil))
      end
    end
  end
end

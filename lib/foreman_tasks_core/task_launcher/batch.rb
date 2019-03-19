module ForemanTasksCore
  module TaskLauncher
    class ParentAction < ::Dynflow::Action
      include Dynflow::Action::WithSubPlans
      include Dynflow::Action::WithPollingSubPlans

      # { task_id => { :action_class => Klass, :input => input } }
      def plan(launcher, input_hash)
        launcher.launch_children(self, input_hash)
        sequence do
          results = plan_self
          plan_action BatchCallback, launcher.prepare_batch(input_hash), results.output[:results]
        end
      end

      def on_finish
        output[:results] = sub_plans.map(&:entry_action).reduce({}) do |acc, cur|
          acc.merge(cur.execution_plan_id => cur.output)
        end
      end

      def finalize
        output.delete(:results)
      end

      def initiate
        ping suspended_action
        wait_for_sub_plans sub_plans
      end

      def rescue_strategy
        Dynflow::Action::Rescue::Fail
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

    class Batch < Abstract
      def launch!(input)
        trigger(nil, ParentAction, self, input)
      end

      def launch_children(parent, input_hash)
        input_hash.each do |task_id, input|
          launcher = Single.new(world, nil, :parent => parent)
          launcher.launch!(wipe_callback(input))
          results[task_id] = launcher.results
        end
      end

      def prepare_batch(input_hash)
        input_hash.select do |task_id, input|
          results[task_id][:result] == 'success'
        end.reduce({}) do |acc, (key, value)|
          acc.merge(results[key][:task_id] => value['action_input']['callback'])
        end
      end

      private

      def wipe_callback(input)
        input.merge('action_input' => input['action_input'].merge('callback' => nil))
      end
    end
  end
end

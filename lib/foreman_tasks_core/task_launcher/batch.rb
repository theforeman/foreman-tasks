module ForemanTasksCore
  module TaskLauncher
    class ParentAction < ::Dynflow::Action
      include Dynflow::Action::WithSubPlans
      include Dynflow::Action::WithPollingSubPlans

      # { task_id => { :action_class => Klass, :input => input } }
      def plan(launcher, input_hash)
        launcher.launch_children(self, input_hash)
        plan_self
      end

      def rescue_strategy
        Dynflow::Action::Rescue::Fail
      end
    end

    class Batch < Abstract
      def launch!(input)
        trigger(nil, ParentAction, self, input)
      end

      def launch_children(parent, input_hash)
        input_hash.each do |task_id, input|
          launcher = child_launcher(parent)
          launcher.launch!(transform_input(input))
          results[task_id] = launcher.results
        end
      end

      def prepare_batch(input_hash)
        success_tasks = input_hash.select do |task_id, _input|
          results[task_id][:result] == 'success'
        end
        success_tasks.reduce({}) do |acc, (key, value)|
          acc.merge(results[key][:task_id] => value['action_input']['callback'])
        end
      end

      private

      def child_launcher(parent)
        Single.new(world, callback, :parent => parent)
      end

      # Identity by default
      def transform_input(input)
        input
      end
    end
  end
end

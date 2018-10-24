require 'foreman_tasks_core/runner'

module ForemanTasksCore
  module TaskLauncher
    class AbstractGroup < Batch
      class Dummy < ::ForemanTasksCore::Runner::Action
        def init_run
          output[:result] = []
          suspend
        end
      end

      class GroupRunner < ::ForemanTasksCore::Runner::Action
        def plan(launcher, input)
          plan_self :targets => launcher.group_runner_input(input), :feature => launcher.feature
        end

        def initiate_runner
          launcher = SmartProxyDynflowCore::TaskLauncherRegistry.fetch(input[:feature])
          launcher.group_runner_class.new(input[:targets])
        end
      end

      def self.group_runner_class
        raise NotImplementedError
      end

      def launch_children(parent, input_hash)
        super(parent, input_hash)
        trigger(parent, GroupRunner, self, input_hash)
      end

      def feature
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
    end
  end
end

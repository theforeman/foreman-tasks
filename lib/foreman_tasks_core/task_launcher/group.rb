module ForemanTasksCore
  module TaskLauncher
    class Group < Batch
      class Dummy < ::ForemanTasksCore::Runner::Action
        def init_run
          output[:result] = []
          suspend
        end
      end

      class GroupRunner < Action
        def plan(launcher, input)
          plan_self :targets => input, :feature => launcher.feature
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

      private

      def child_launcher(parent)
        Single.new(world, callback, :parent => parent, :action_class_override => Dummy)
      end
    end
  end
end

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

      def initiate
        ping suspended_action
        wait_for_sub_plans sub_plans
      end
    end

    class Batch < Abstract
      def launch!(input)
        trigger(nil, ParentAction, self, input)
      end

      def launch_children(parent, input_hash)
        input_hash.each do |task_id, input|
          launcher = Single.new(world, callback, :parent => parent)
          launcher.launch!(input)
          results[task_id] = launcher.results
        end
      end
    end
  end
end

require 'foreman_tasks_core/runner/action'

module ForemanTasksCore
  class BatchRunnerAction < ::ForemanTasksCore::Runner::Action
    def plan(launcher, input)
      plan_self :targets => launcher.runner_input(input), :operation => launcher.operation
    end

    def initiate_runner
      launcher = SmartProxyDynflowCore::TaskLauncherRegistry.fetch(input[:operation])
      launcher.runner_class.new(input[:targets], suspended_action: suspended_action)
    end
  end
end

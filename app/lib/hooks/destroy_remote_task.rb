module Hooks
  class DestroyRemoteTask < ::Dynflow::ExecutionPlan::Hooks::Abstract
    def on_stopped(_execution_plan, action)
      action.remote_task.destroy!
    end
  end
end

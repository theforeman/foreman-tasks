module Hooks
  class WipeSecrets < ::Dynflow::ExecutionPlan::Hooks::Abstract
    # Removes the :secrets key from the action's input and output and saves the action
    def on_stopped(_execution_plan, action)
      action.wipe_secrets!
      action.world.persistence.save_action(action.execution_plan_id,
                                           action)
    end
  end
end

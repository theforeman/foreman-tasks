module ForemanTasksCore
  class ShareableAction < ::Dynflow::Action
    def plan(input)
      input = input.dup
      callback = input.delete('callback')
      if callback
        input[:task_id] = callback['task_id']
      else
        input[:task_id] ||= SecureRandom.uuid
      end

      planned_action = plan_self(input)
      # code only applicable, when run with SmartProxyDynflowCore in place
      if defined?(SmartProxyDynflowCore::Callback) && callback
        plan_action(SmartProxyDynflowCore::Callback::Action, callback, planned_action.output)
      end
    end
  end
end

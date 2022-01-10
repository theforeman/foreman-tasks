module Actions
  module Helpers
    module LifecycleLogging
      def self.included(base)
        base.execution_plan_hooks.use :log_task_state_change
      end

      def log_task_state_change(execution_plan)
        return unless root_action?
        logger = ::Rails.application.dynflow.world.action_logger
        task_id = ForemanTasks::Task::DynflowTask.where(external_id: execution_plan.id).pluck(:id).first

        task_id_parts = []
        task_id_parts << "id: #{task_id}" if task_id
        task_id_parts << "execution_plan_id: #{execution_plan.id}"
        result_info = " result: #{execution_plan.result}" if [:stopped, :paused].include?(execution_plan.state)
        logger.info("Task {label: #{execution_plan.label}, #{task_id_parts.join(', ')}} state changed: #{execution_plan.state} #{result_info}")
      end
    end
  end
end

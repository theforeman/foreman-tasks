module ForemanTasks
  module TaskGroups
    class RecurringLogicTaskGroup < ::ForemanTasks::TaskGroup
      has_one :recurring_logic, :foreign_key => :task_group_id, :dependent => :nullify

      alias resource recurring_logic

      def resource_name
        N_('Recurring logic')
      end
    end
  end
end

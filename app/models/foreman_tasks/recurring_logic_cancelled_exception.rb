module ForemanTasks
  class RecurringLogicCancelledException < ::Foreman::Exception
    def initialize(msg = N_("Cannot update a cancelled Recurring Logic."))
      super
    end
  end
end

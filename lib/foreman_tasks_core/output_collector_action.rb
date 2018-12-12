module ForemanTasksCore
  class OutputCollectorAction < ::ForemanTasksCore::Runner::Action
    def init_run
      output[:result] = []
      suspend
    end
  end
end

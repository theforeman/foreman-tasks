module ForemanTasksCore
  module Runner
    class Action
      class Dummy < ::ForemanTasksCore::Runner::Action
        def init_run
          output[:result] = []
          suspend
        end
      end
    end
  end
end
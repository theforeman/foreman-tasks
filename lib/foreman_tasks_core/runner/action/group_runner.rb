module ForemanTasksCore
  module Runner
    class Action
      class GroupRunner < Action
        def initiate_runner
          parent_runner_class.new(input[:targets])
        end

        private

        def parent_runner_class
          raise NotImplementedError
        end
      end
    end
  end
end
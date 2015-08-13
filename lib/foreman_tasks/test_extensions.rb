module ForemanTasks
  module TestExtensions
    module AccessPermissionsTestExtension
      def setup
        super
        if defined?(AccessPermissionsTest) && self.class == AccessPermissionsTest
          skip 'used by proxy only' if __name__.include?('foreman_tasks/api/tasks/callback')
        end
      end
    end
  end
end

ActiveSupport::TestCase.send(:include, ForemanTasks::TestExtensions::AccessPermissionsTestExtension)

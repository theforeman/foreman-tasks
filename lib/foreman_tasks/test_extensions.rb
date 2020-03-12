module ForemanTasks
  module TestExtensions
    module AccessPermissionsTestExtension
      def setup
        super
        if defined?(AccessPermissionsTest) && self.class == AccessPermissionsTest
          test_name = @method_name || @NAME
          # for compatibility with Foreman 1.10
          test_name = __name__ if test_name.nil? && respond_to?(:__name__)
          skip 'used by proxy only' if test_name.include?('foreman_tasks/api/tasks/callback')
        end
      end
    end
  end
end

ActiveSupport::TestCase.include ForemanTasks::TestExtensions::AccessPermissionsTestExtension

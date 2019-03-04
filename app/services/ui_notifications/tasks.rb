module UINotifications
  module Tasks
    class Base < ::UINotifications::Base
      def initialize(task)
        @subject = @task = task
      end

      def initiator
        User.anonymous_admin
      end

      def troubleshooting_help_generator
        return @troubleshooting_help_generator if defined? @troubleshooting_help_generator
        @troubleshooting_help_generator = if @task.main_action
                                            ForemanTasks::TroubleshootingHelpGenerator.new(@task.main_action)
                                          end
      end
    end
  end
end

module ForemanTasks
  module Concerns
    module ArchitectureActionSubject
      extend ActiveSupport::Concern
      include ForemanTasks::Concerns::ActionSubject

      included do
        after_create :trigger_create_action
        after_update :trigger_update_action
        after_destroy :trigger_destroy_action
      end

      def trigger_create_action
        ForemanTasks.trigger(::Actions::Foreman::Architecture::Create, self)
      end

      def trigger_update_action
        ForemanTasks.trigger(::Actions::Foreman::Architecture::Update, self)
      end

      def trigger_destroy_action
        ForemanTasks.trigger(::Actions::Foreman::Architecture::Destroy, self)
      end

    end
  end
end

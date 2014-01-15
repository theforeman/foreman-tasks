module ForemanTasks
  module Concerns
    module ArchitectureActionSubject
      extend ActiveSupport::Concern
      include ForemanTasks::Concerns::ActionSubject

      def create_action
        ::Actions::Foreman::Architecture::Create
      end

      def update_action
        ::Actions::Foreman::Architecture::Update
      end

      def destroy_action
        ::Actions::Foreman::Architecture::Destroy
      end
    end
  end
end

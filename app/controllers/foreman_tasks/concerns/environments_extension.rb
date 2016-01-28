module ForemanTasks
  module Concerns
    module EnvironmentsExtension
      extend ActiveSupport::Concern

      included do
        alias_method_chain :obsolete_and_new, :dynflow
      end

      def obsolete_and_new_with_dynflow
        task = ForemanTasks.async_task(::Actions::Foreman::Puppetclass::Import,
                                       params)

        notice _("Added import task to queue, it will be run shortly")
        rescue ::Foreman::Exception => e
          error _("Failed to add task to queue: %s") % e.to_s
        ensure
          redirect_to :controller => controller_path
        end

    end
  end
end


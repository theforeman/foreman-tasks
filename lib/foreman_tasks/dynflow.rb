require 'dynflow'

module ForemanTasks
  # Class for configuring and preparing the Dynflow runtime environment.
  class Dynflow < ::Dynflow::Rails
    require 'foreman_tasks/dynflow/console_authorizer'

    def web_console
      ::Dynflow::Web.setup do
        before do
          if !Setting[:dynflow_enable_console] ||
             (Setting[:dynflow_console_require_auth] && !ConsoleAuthorizer.from_env(env).allow?)
            halt 403, 'Access forbidden'
          end
        end

        set(:custom_navigation) do
          { _('Back to tasks') => "/#{ForemanTasks::TasksController.controller_path}" }
        end
        set(:world) { ::Rails.application.dynflow.world }
        # Do not show Sinatra's pretty error pages in production
        set(:show_exceptions) { ::Rails.env.development? }
        # Let the errors propagate out from Sinatra to Rails.
        # Without this, we'd only get a mostly blank 500 ISE page
        set(:raise_errors) { !::Rails.env.development? }
      end
    end
  end
end

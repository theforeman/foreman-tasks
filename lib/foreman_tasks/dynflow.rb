# -*- coding: utf-8 -*-
require 'dynflow'

module ForemanTasks
  # Class for configuring and preparing the Dynflow runtime environment.
  class Dynflow < ::Dynflow::Rails
    require 'foreman_tasks/dynflow/console_authorizer'

    def web_console
      ::Dynflow::Web.setup do
        before do
          if !Setting[:dynflow_enable_console] ||
             (Setting[:dynflow_console_require_auth] && !ConsoleAuthorizer.new(env).allow?)
            halt 403, 'Access forbidden'
          end
        end

        set(:custom_navigation) do
          { _('Back to tasks') => "/#{ForemanTasks::TasksController.controller_path}" }
        end
        set(:world) { Rails.application.dynflow.world }
      end
    end
  end
end

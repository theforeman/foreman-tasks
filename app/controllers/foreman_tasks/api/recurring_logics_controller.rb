module ForemanTasks
  module Api
    class RecurringLogicsController < ::Api::V2::BaseController
      include ::Api::Version2
      include Concerns::Parameters::RecurringLogic

      resource_description do
        resource_id 'recurring_logics'
        api_version 'v2'
        api_base_url '/foreman_tasks/api'
      end

      before_action :find_resource, :only => %w[show cancel update]

      api :GET, '/recurring_logics', N_('List recurring logics')
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        @recurring_logics = resource_scope_for_index
      end

      api :GET, '/recurring_logics/:id', N_('Show recurring logic details')
      param :id, :identifier, desc: 'ID of the recurring logic', required: true
      def show; end

      api :PUT, '/recurring_logics/:id', N_('Update recurring logic')
      param :id, :identifier, desc: 'ID of the recurring logic', required: true
      param :enabled, :boolean, desc: 'Whether the recurring logic is enabled or disabled.', required: false
      def update
        process_response @recurring_logic.update(recurring_logic_params)
      end

      api :POST, '/recurring_logics/:id/cancel', N_('Cancel recurring logic')
      param :id, :identifier, desc: 'ID of the recurring logic', required: true
      def cancel
        process_response @recurring_logic.cancel
      end

      def resource_class
        ForemanTasks::RecurringLogic
      end

      def action_permission
        case params[:action]
        when 'cancel'
          'edit'
        else
          super
        end
      end
    end
  end
end

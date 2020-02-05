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

      # Foreman right now doesn't have mechanism to
      # cause general BadRequest handling, resuing the Apipie::ParamError
      # for now http://projects.theforeman.org/issues/3957
      class BadRequest < Apipie::ParamError
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

      api :POST, '/recurring_logics/bulk_destroy', N_('Delete recurring logics by search query')
      param :search, String, :desc => N_('Search query'), :required => true
      def bulk_destroy
        if params[:search].blank?
          raise BadRequest, _('Please provide a search parameter in the request')
        end
        scope = resource_scope.search_for(params[:search])
        scope.each(&:destroy!)
        render json: { destroyed: scope }
      rescue ActiveRecord::RecordNotDestroyed => error
        render json: { error: error, scope: scope }, status: :bad_request
      end

      def action_permission
        case params[:action]
        when 'cancel', 'bulk_destroy'
          'edit'
        else
          super
        end
      end
    end
  end
end

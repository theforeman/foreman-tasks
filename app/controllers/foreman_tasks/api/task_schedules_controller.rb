module ForemanTasks
  module Api
    class TaskSchedulesController < ::Api::V2::BaseController
      include ::Api::Version2

      resource_description do
        resource_id 'task_schedules'
        api_version 'v2'
        api_base_url '/foreman_tasks/api'
      end

      before_filter :find_resource, :only => %w{show cancel destroy}

      api :GET, '/task_schedules', N_('List recurring logics')
      def index
        @recurring_logics = resource_scope_for_index
      end

      api :GET, '/task_schedules/:id', N_('Show recurring logic details')
      param :id, :identifier, desc: "ID of the recurring logic", required: true
      def show
      end

      api :POST, '/task_schedules/:id/cancel', N_('Cancel recurring logic')
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

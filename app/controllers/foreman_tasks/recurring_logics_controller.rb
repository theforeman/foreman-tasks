module ForemanTasks
  class RecurringLogicsController < ::ApplicationController
    include Foreman::Controller::AutoCompleteSearch

    before_action :find_recurring_logic, :only => [:show, :cancel, :enable, :disable]

    def index
      @errors = params[:errors]
      @recurring_logics = filter(resource_base)
    end

    def show; end

    def enable
      change_enabled(true)
    end

    def disable
      change_enabled(false)
    end

    def cancel
      @recurring_logic.cancel
      redirect_to :action => :index
    end

    def clear_cancelled
      scope = resource_base.search_for('state=cancelled')
      scope.destroy_all
      redirect_to :action => :index
    end

    def controller_name
      'foreman_tasks_recurring_logics'
    end

    def resource_class
      ::ForemanTasks::RecurringLogic
    end

    private

    def change_enabled(value)
      begin
        @recurring_logic.update!(:enabled => value)
        flash[:success] = if value
                            _('The recurring logic was enabled.')
                          else
                            _('The recurring logic was disabled.')
                          end
      rescue RecurringLogicCancelledException => e
        @errors = e.message
      end
      redirect_to :action => :index, :errors => @errors
    end

    def find_recurring_logic
      @recurring_logic ||= ::ForemanTasks::RecurringLogic.find(params[:id])
    end

    def filter(scope)
      scope.search_for(params[:search])
           .paginate(:page => params[:page], :per_page => params[:per_page])
    end

    def action_permission
      case params[:action]
      when 'clear_cancelled'
        'edit'
      else
        super
      end
    end

    def controller_permission
      'recurring_logics'
    end
  end
end

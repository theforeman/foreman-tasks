module ForemanTasks
  class RecurringLogicsController < ::ApplicationController
    before_action :find_recurring_logic, :only => [:show, :cancel]

    def index
      @recurring_logics = filter(resource_base)
    end

    def show; end

    def cancel
      @recurring_logic.cancel
      redirect_to :action => :index
    end

    def controller_name
      'foreman_tasks_recurring_logics'
    end

    def resource_class
      ::ForemanTasks::RecurringLogic
    end

    private

    def find_recurring_logic
      @recurring_logic ||= ::ForemanTasks::RecurringLogic.find(params[:id])
    end

    def filter(scope)
      scope.search_for(params[:search]).paginate(:page => params[:page])
    end
  end
end

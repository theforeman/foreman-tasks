module ForemanTasks
  class TasksController < ::ApplicationController
    include Foreman::Controller::AutoCompleteSearch

    def show
      @task = Task.find(params[:id])
    end

    def index
      params[:order] ||= 'started_at DESC'
      @tasks         = Task.
          search_for(params[:search], :order => params[:order]).
          paginate(:page => params[:page])
    end

    # we need do this to make the Foreman helpers working properly
    def controller_name
      'foreman_tasks_tasks'
    end
  end
end

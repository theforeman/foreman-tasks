module ForemanTasks
  class TasksController < ::ApplicationController
    include Foreman::Controller::AutoCompleteSearch

    def show
      @task = Task.find(params[:id])
    end

    def index
      @tasks = Task.search_for(params[:search], :order => params[:order]).paginate(:page => params[:page])
    end

    protected

    def controller_name
      "foreman_tasks_tasks"
    end
  end
end

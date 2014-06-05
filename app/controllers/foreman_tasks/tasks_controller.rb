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

    def resume
      task = find_task
      if task.resumable?
        ForemanTasks.dynflow.world.execute(task.execution_plan.id)
        flash[:notice] = _('The execution was resumed.')
      else
        flash[:warning] = _('The execution has to be resumable.')
      end
      redirect_to foreman_tasks_task_path(task)
    end

    def unlock
      task = find_task
      if task.paused?
        task.state = :stopped
        task.save!
        flash[:notice] = _('The task resrouces were unlocked.')
      else
        flash[:warning] =  _('The execution has to be paused.')
      end
      redirect_to foreman_tasks_task_path(task)
    end

    def force_unlock
      task       = find_task
      task.state = :stopped
      task.save!
      flash[:notice] = _('The task resources were unlocked with force.')
      redirect_to foreman_tasks_task_path(task)
    end

    # we need do this to make the Foreman helpers working properly
    def controller_name
      'foreman_tasks_tasks'
    end

    private

    def find_task
      ForemanTasks::Task::DynflowTask.find(params[:id])
    end

  end
end

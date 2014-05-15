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
      paused_task_action _('The execution was resumed.') do |task|
        ForemanTasks.dynflow.world.execute(task.execution_plan.id)
      end
    end

    def stop
      paused_task_action _('The execution was stopped.') do |task|
        # FIXME also stop dynflow execution plan
        task.state = :stopped
        task.save!
      end
    end

    def force_stop
      task       = find_task
      task.state = :stopped
      task.save!
      flash[:notice] = _('The task was stopped with force.')
      redirect_to foreman_tasks_task_path(task)
    end

    # we need do this to make the Foreman helpers working properly
    def controller_name
      'foreman_tasks_tasks'
    end

    private

    def paused_task_action(success_message)
      task = find_task
      if task.state != 'paused'
        flash[:warning] = _('The execution has to be paused.')
      else
        yield task
        flash[:notice] = success_message
      end

      redirect_to foreman_tasks_task_path(task)
    end

    def find_task
      ForemanTasks::Task::DynflowTask.find(params[:id])
    end

  end
end

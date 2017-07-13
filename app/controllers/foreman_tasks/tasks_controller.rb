module ForemanTasks
  class TasksController < ::ApplicationController
    include Foreman::Controller::AutoCompleteSearch

    before_action :restrict_dangerous_actions, :only => [:unlock, :force_unlock]

    def show
      @task = Task.find(params[:id])
    end

    def index
      params[:order] ||= 'started_at DESC'
      @tasks = filter(resource_base)
    end

    def sub_tasks
      task   = Task.find(params[:id])
      @tasks = filter(task.sub_tasks)
      render :index
    end

    def cancel_step
      task = find_dynflow_task
      flash[:notice] = _('Trying to cancel step %s') % params[:step_id]
      ForemanTasks.dynflow.world.event(task.external_id, params[:step_id].to_i, ::Dynflow::Action::Cancellable::Cancel).wait
      redirect_to foreman_tasks_task_path(task)
    end

    def cancel
      task = find_dynflow_task
      if task.cancel
        flash[:notice] = _('Trying to cancel the task')
      else
        flash[:warning] = _('The task cannot be cancelled at the moment.')
      end
      redirect_to :back
    end

    def abort
      task = find_dynflow_task
      if task.abort
        flash[:notice] = _('Trying to abort the task')
      else
        flash[:warning] = _('The task cannot be aborted at the moment.')
      end
      redirect_to :back
    end

    def resume
      task = find_dynflow_task
      if task.resumable?
        ForemanTasks.dynflow.world.execute(task.execution_plan.id)
        flash[:notice] = _('The execution was resumed.')
      else
        flash[:warning] = _('The execution has to be resumable.')
      end
      redirect_to :back
    end

    def unlock
      task = find_dynflow_task
      if task.paused?
        task.state = :stopped
        task.save!
        flash[:notice] = _('The task resources were unlocked.')
      else
        flash[:warning] = _('The execution has to be paused.')
      end
      redirect_to :back
    end

    def force_unlock
      task       = find_dynflow_task
      task.state = :stopped
      task.save!
      flash[:notice] = _('The task resources were unlocked with force.')
      redirect_to :back
    end

    # we need do this to make the Foreman helpers working properly
    def controller_name
      'foreman_tasks_tasks'
    end

    private

    def restrict_dangerous_actions
      render_403 unless Setting['dynflow_allow_dangerous_actions']
    end

    def controller_permission
      'foreman_tasks'
    end

    def action_permission
      case params[:action]
      when 'sub_tasks'
        :view
      when 'resume', 'unlock', 'force_unlock', 'cancel_step', 'cancel', 'abort'
        :edit
      else
        super
      end
    end

    def resource_scope(_options = {})
      @resource_scope ||= ForemanTasks::Task.authorized("#{action_permission}_foreman_tasks")
    end

    def find_dynflow_task
      resource_scope.where(:type => 'ForemanTasks::Task::DynflowTask').find(params[:id])
    end

    def filter(scope)
      scope.search_for(params[:search], :order => params[:order])
           .paginate(:page => params[:page]).distinct
    end
  end
end

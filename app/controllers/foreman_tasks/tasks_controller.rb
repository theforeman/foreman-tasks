module ForemanTasks
  class TasksController < ::ApplicationController
    include Foreman::Controller::AutoCompleteSearch
    include Foreman::Controller::CsvResponder
    include ForemanTasks::FindTasksCommon

    before_action :find_dynflow_task, only: [:unlock, :force_unlock, :cancel, :cancel_step, :resume]

    def show
      @task = resource_base.find(params[:id])
      render :layout => !request.xhr?
    end

    def index
      params[:order] ||= 'started_at DESC'
      respond_with_tasks resource_base
    end

    def summary
      scope = resource_base.search_for(current_taxonomy_search).select(:id)
      render json: Task::Summarizer.new(Task.where(:id => scope), params[:recent_timeframe].to_i).summary
    end

    def summary_sub_tasks
      filtered_scope = resource_base.find(params[:id]).sub_tasks
      render :json => Task::Summarizer.new(filtered_scope, params[:recent_timeframe].to_i).summary
    end

    def sub_tasks
      # @task is used when rendering breadcrumbs
      @task = resource_base.find(params[:id])
      respond_with_tasks @task.sub_tasks
    end

    def cancel_step
      result = ForemanTasks.dynflow.world.event(@dynflow_task.external_id, params[:step_id].to_i, ::Dynflow::Action::Cancellable::Cancel).wait
      if result.rejected?
        render json: { error: result.reason }, status: :bad_request
      else
        render json: { statusText: 'OK' }
      end
    end

    def cancel
      if @dynflow_task.cancel
        render json: { statusText: 'OK' }
      else
        render json: {}, status: :bad_request
      end
    end

    def abort
      if @dynflow_task.abort
        flash[:info] = _('Trying to abort the task')
      else
        flash[:warning] = _('The task cannot be aborted at the moment.')
      end
      redirect_back(:fallback_location => foreman_tasks_task_path(@dynflow_task))
    end

    def resume
      if @dynflow_task.resumable?
        ForemanTasks.dynflow.world.execute(@dynflow_task.execution_plan.id)
        render json: { statusText: 'OK' }
      else
        render json: {}, status: :bad_request
      end
    end

    def unlock
      if @dynflow_task.paused?
        @dynflow_task.halt
        render json: { statusText: 'OK' }
      else
        render json: {}, status: :bad_request
      end
    end

    def force_unlock
      if @dynflow_task.pending?
        @dynflow_task.halt
        render json: { statusText: 'OK' }
      else
        # Cannot halt an already stopped task
        render json: {}, status: :bad_request
      end
    end

    # we need do this to make the Foreman helpers working properly
    def controller_name
      'foreman_tasks_tasks'
    end

    def resource_class
      ForemanTasks::Task
    end

    private

    def respond_with_tasks(scope)
      @tasks = filter(scope, paginate: false).with_duration
      csv_response(@tasks, [:id, :action, :state, :result, 'started_at.in_time_zone', 'ended_at.in_time_zone', :duration, :username], ['Id', 'Action', 'State', 'Result', 'Started At', 'Ended At', 'Duration', 'User'])
    end

    def controller_permission
      'foreman_tasks'
    end

    def action_permission
      case params[:action]
      when 'sub_tasks', 'summary', 'summary_sub_tasks'
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
      @dynflow_task = resource_scope.where(:type => 'ForemanTasks::Task::DynflowTask').find(params[:id])
    end

    def filter(scope, paginate: true)
      search = current_taxonomy_search
      search = [search, params[:search]].select(&:present?).join(' AND ')
      scope = scope.search_for(search, order: params[:order])
      scope = scope.paginate(page: params[:page], per_page: params[:per_page]) if paginate
      scope.distinct
    end
  end
end

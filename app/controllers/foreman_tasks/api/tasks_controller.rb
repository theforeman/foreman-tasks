module ForemanTasks
  module Api
    class TasksController < ::Api::V2::BaseController
      include ForemanTasks::FindTasksCommon
      include ::Foreman::Controller::SmartProxyAuth
      add_smart_proxy_filters :callback, :features => 'Dynflow'

      resource_description do
        resource_id 'foreman_tasks'
        api_version 'v2'
        api_base_url '/foreman_tasks/api'
      end

      # Foreman right now doesn't have mechanism to
      # cause general BadRequest handling, resuing the Apipie::ParamError
      # for now http://projects.theforeman.org/issues/3957
      class BadRequest < Apipie::ParamError
      end

      before_action :find_task, :only => [:show, :details]

      api :GET, '/tasks/summary', 'Show task summary'
      def summary
        render :json => ForemanTasks::Task::Summarizer.new(resource_scope).summarize_by_status
      end

      api :GET, '/tasks/:id', 'Show task details'
      param :id, :identifier, desc: 'UUID of the task'
      def show; end

      api :GET, '/tasks/:id/details', 'Show task extended details'
      param :id, :identifier, desc: 'UUID of the task'
      def details; end

      api :POST, '/tasks/bulk_search', 'List dynflow tasks for uuids'
      param :searches, Array, :desc => 'List of uuids to fetch info about' do
        param :search_id, String, :desc => <<-DESC
          Arbitraty value for client to identify the the request parts with results.
          It's passed in the results to be able to pair the requests and responses properly.
        DESC
        param :type, %w[user resource task]
        param :task_id, String, :desc => <<-DESC
          In case :type = 'task', find the task by the uuid
        DESC
        param :user_id, String, :desc => <<-DESC
          In case :type = 'user', find tasks for the user
        DESC
        param :resource_type, String, :desc => <<-DESC
          In case :type = 'resource', what resource type we're searching the tasks for
        DESC
        param :resource_type, String, :desc => <<-DESC
          In case :type = 'resource', what resource id we're searching the tasks for
        DESC
        param :action_types, [String], :desc => <<-DESC
          Return just tasks of given action type, e.g. `["Actions::Katello::Repository::Synchronize"]`
        DESC
        param :active_only, :bool
        param :page, String
        param :per_page, String
      end
      desc <<-DESC
        For every search it returns the list of tasks that satisfty the condition.
        The reason for supporting multiple searches is the UI that might be ending
        needing periodic updates on task status for various searches at the same time.
        This way, it is possible to get all the task statuses with one request.
      DESC
      def bulk_search
        searches = Array(params[:searches])
        @tasks   = {}

        ret = searches.map do |search_params|
          { search_params: search_params,
            results:       search_tasks(search_params) }
        end
        render :json => ret
      end

      api :POST, '/tasks/bulk_resume', N_('Resume all paused error tasks')
      desc <<~DOC
        Resumes all selected resumable tasks. If neither a search query nor an
        explicit list of task IDs is provided, it tries to resume all tasks in
        paused state with result error.
      DOC
      param :search, String, :desc => N_('Resume tasks matching search string')
      param :task_ids, Array, :desc => N_('Resume specific tasks by ID')
      def bulk_resume
        if params[:search].nil? && params[:task_ids].nil?
          params[:search] = 'state = paused and result = error'
        end
        resumed = []
        failed = []
        skipped = []
        filtered_scope = bulk_scope
        filtered_scope.each do |task|
          if task.resumable?
            begin
              ForemanTasks.dynflow.world.execute(task.execution_plan.id)
              resumed << task_hash(task)
            rescue RuntimeError
              failed << task_hash(task)
            end
          else
            skipped << task_hash(task)
          end
        end
        if params[:search]
          notification = UINotifications::Tasks::TaskBulkResume.new(filtered_scope.first, resumed.length, failed.length, skipped.length)
          notification.deliver!
        end
        render :json => {
          total: resumed.length + failed.length + skipped.length,
          resumed: resumed,
          failed: failed,
          skipped: skipped,
        }
      end

      api :POST, '/tasks/bulk_cancel', N_('Cancel selected cancellable tasks')
      desc <<~DOC
        Cancels all selected cancellable tasks. Requires a search query or an
        explicit list of task IDs to be provided.
      DOC
      param :search, String, :desc => N_('Cancel tasks matching search string')
      param :task_ids, Array, :desc => N_('Cancel specific tasks by ID')
      error :bad_request, 'Returned if neither search nor task_ids parameter is provided.'
      def bulk_cancel
        if params[:search].nil? && params[:task_ids].nil?
          raise BadRequest, _('Please provide at least one of search or task_ids parameters in the request')
        end
        filtered_scope = bulk_scope
        cancelled, skipped = filtered_scope.partition(&:cancellable?)
        cancelled.each(&:cancel)
        if params[:search]
          notification = UINotifications::Tasks::TaskBulkCancel.new(filtered_scope.first, cancelled.length, skipped.length)
          notification.deliver!
        end
        render :json => {
          total: cancelled.length + skipped.length,
          cancelled: cancelled,
          skipped: skipped,
        }
      end

      api :POST, '/tasks/bulk_stop', N_('Stop selected stoppable tasks')
      desc <<~DOC
        Stops all selected tasks which are not already stopped. Requires a
        search query or an explicit list of task IDs to be provided.
      DOC
      param :search, String, :desc => N_('Stop tasks matching search string')
      param :task_ids, Array, :desc => N_('Stop specific tasks by ID')
      error :bad_request, 'Returned if neither search nor task_ids parameter is provided.'
      def bulk_stop
        if params[:search].nil? && params[:task_ids].nil?
          raise BadRequest, _('Please provide at least one of search or task_ids parameters in the request')
        end

        filtered_scope = bulk_scope
        total_length = filtered_scope.count
        to_stop = filtered_scope.where.not(state: :stopped)
        to_stop_length = to_stop.count
        skipped_length = total_length - to_stop_length

        to_stop.find_each(&:halt)

        if params[:search]
          notification = UINotifications::Tasks::TaskBulkStop.new(filtered_scope.first, to_stop_length, skipped_length)
          notification.deliver!
        end

        render :json => {
          total: total_length,
          stopped_length: to_stop_length,
          skipped_length: skipped_length,
        }
      end

      api :GET, '/tasks', N_('List tasks')
      api :GET, '/tasks/:parent_task_id/sub_tasks', 'Show sub_tasks details'
      param :parent_task_id, :identifier, desc: 'UUID of the task'
      param_group :search_and_pagination, ::Api::V2::BaseController
      def index
        params[:order] ||= 'started_at DESC'
        @tasks = resource_scope_for_index
      end

      def search_options
        [search_query, { :order => params[:order] }]
      end

      def_param_group :callback_target do
        param :callback, Hash do
          param :task_id, :identifier, :desc => N_('UUID of the task')
          param :step_id, String, :desc => N_('The ID of the step inside the execution plan to send the event to')
        end
      end

      def_param_group :callback do
        param_group :callback_target, TasksController
        param :data, Hash, :desc => N_('Data to be sent to the action')
      end

      api :POST, '/tasks/callback', N_('Send data to the task from external executor (such as smart_proxy_dynflow)')
      param_group :callback
      param :callbacks, Array do
        param_group :callback, TasksController
      end
      def callback
        callbacks = params.key?(:callback) ? Array(params) : params[:callbacks]
        ids = callbacks.map { |payload| payload[:callback][:task_id] }
        external_map = Hash[*ForemanTasks::Task.where(:id => ids).pluck(:id, :external_id).flatten]
        callbacks.each do |payload|
          # We need to call .to_unsafe_h to unwrap the hash from ActionController::Parameters
          callback = payload[:callback]
          process_callback(external_map[callback[:task_id]], callback[:step_id].to_i, payload[:data].to_unsafe_h, :request_id => ::Logging.mdc['request'])
        end
        render :json => { :message => 'processing' }.to_json
      end

      private

      def process_callback(execution_plan_uuid, step_id, data, meta)
        ForemanTasks.dynflow.world.event(execution_plan_uuid,
                                         step_id,
                                         ::Actions::ProxyAction::CallbackData.new(data, meta))
      end

      def search_tasks(search_params)
        scope = resource_scope_for_index
        scope = ordering_scope(scope, search_params)
        scope = search_scope(scope, search_params)
        scope = active_scope(scope, search_params)
        scope = action_types_scope(scope, search_params)
        scope = pagination_scope(scope, search_params)
        scope.all.map { |task| task_hash(task) }
      end

      def search_scope(scope, search_params)
        case search_params[:type]
        when 'all'
          scope
        when 'user'
          if search_params[:user_id].blank?
            raise BadRequest, _('User search_params requires user_id to be specified')
          end
          scope.search_for("user_id = #{search_params[:user_id]}")
        when 'resource'
          if search_params[:resource_type].blank? || search_params[:resource_id].blank?
            raise BadRequest,
                  _('Resource search_params requires resource_type and resource_id to be specified')
          end
          scope.joins(:links).where(foreman_tasks_links:
                                        { resource_type: search_params[:resource_type],
                                          resource_id:   search_params[:resource_id] })
        when 'task'
          if search_params[:task_id].blank?
            raise BadRequest, _('Task search_params requires task_id to be specified')
          end
          scope.where(id: search_params[:task_id])
        else
          raise BadRequest, _('Type %s for search_params is not supported') % search_params[:type]
        end
      end

      def active_scope(scope, search_params)
        if search_params[:active_only]
          scope.active
        else
          scope
        end
      end

      def action_types_scope(scope, search_params)
        action_types = search_params[:action_types]
        if action_types
          scope.for_action_types(action_types)
        else
          scope
        end
      end

      def pagination_scope(scope, search_params)
        page     = search_params[:page] || 1
        per_page = search_params[:per_page] || 10
        scope.limit(per_page).offset((page.to_i - 1) * per_page.to_i)
      end

      def ordering_scope(scope, ordering_params)
        sort_by = ordering_params[:sort_by] || 'started_at'
        sort_by = 'foreman_tasks_tasks.' + sort_by if sort_by == 'started_at'
        sort_order = ordering_params[:sort_order] || 'DESC'
        scope.order("#{sort_by} #{sort_order}")
      end

      def task_hash(task)
        return @tasks[task.id] if @tasks && @tasks[task.id]
        task_hash = Rabl.render(
          task, 'show',
          view_path: "#{ForemanTasks::Engine.root}/app/views/foreman_tasks/api/tasks",
          format:    :hash,
          scope:     self
        )
        @tasks[task.id] = task_hash if @tasks
        task_hash
      end

      def resource_class
        @resource_class ||= ForemanTasks::Task
      end

      def find_task
        @task = resource_scope.with_duration.find(params[:id])
      end

      def resource_scope(_options = {})
        scope = ForemanTasks::Task.authorized("#{action_permission}_foreman_tasks")
        scope = scope.where(:parent_task_id => params[:parent_task_id]) if params[:parent_task_id]
        scope
      end

      def resource_scope_for_index(*args)
        super.with_duration.distinct
      end

      def controller_permission
        'foreman_tasks'
      end

      def action_permission
        case params[:action]
        when 'bulk_search', 'summary', 'details', 'sub_tasks'
          :view
        when 'bulk_resume', 'bulk_cancel', 'bulk_stop'
          :edit
        else
          super
        end
      end

      def bulk_scope
        scope = resource_scope
        scope = scope.search_for(params[:search]) if params[:search]
        scope = scope.select('DISTINCT foreman_tasks_tasks.*')
        scope = scope.where(:id => params[:task_ids]) if params[:task_ids]
        scope
      end
    end
  end
end

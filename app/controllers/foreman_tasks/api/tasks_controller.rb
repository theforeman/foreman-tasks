module ForemanTasks
  # rubocop:disable Metrics/ClassLength
  module Api
    class TasksController < ::Api::V2::BaseController
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

      before_action :find_task, :only => [:show]

      api :GET, '/tasks/summary', 'Show task summary'
      def summary
        render :json => ForemanTasks::Task::Summarizer.new.summarize_by_status
      end

      api :GET, '/tasks/:id', 'Show task details'
      param :id, :identifier, desc: 'UUID of the task'
      def show; end

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
          Return just tasks of given action type, e.g. ["Actions::Katello::Repository::Synchronize"]
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
      param :search, String, :desc => N_('Resume tasks matching search string')
      param :task_ids, Array, :desc => N_('Resume specific tasks by ID')
      def bulk_resume
        scope = resource_scope
        scope = scope.search_for(params[:search]) if params[:search]
        scope = scope.select('DISTINCT foreman_tasks_tasks.*')
        if params[:search].nil? && params[:task_ids].nil?
          scope = scope.where(:state => :paused)
          scope = scope.where(:result => :error)
        end
        scope = scope.where(:id => params[:task_ids]) if params[:task_ids]

        resumed = []
        failed = []
        skipped = []
        scope.each do |task|
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

        render :json => {
          total: resumed.length + failed.length + skipped.length,
          resumed: resumed,
          failed: failed,
          skipped: skipped
        }
      end

      api :GET, '/tasks', N_('List tasks')
      param :search, String, :desc => N_('Search string')
      param :page, :number, :desc => N_('Page number, starting at 1')
      param :per_page, :number, :desc => N_('Number of results per page to return')
      param :order, String, :desc => N_("Sort field and order, e.g. 'name DESC'")
      param :sort, Hash, :desc => N_("Hash version of 'order' param") do
        param :by, String, :desc => N_('Field to sort the results on')
        param :order, String, :desc => N_('How to order the sorted results (e.g. ASC for ascending)')
      end
      def index
        scope = resource_scope.search_for(params[:search]).select('DISTINCT foreman_tasks_tasks.*')

        total = resource_scope.count
        subtotal = scope.count

        ordering_params = {
          sort_by: params[:sort_by] || 'started_at',
          sort_order: params[:sort_order] || 'DESC'
        }
        scope = ordering_scope(scope, ordering_params)

        pagination_params = {
          page: params[:page] || 1,
          per_page: params[:per_page] || Setting[:entries_per_page] || 20
        }
        scope = pagination_scope(scope, pagination_params)
        results = scope.map { |task| task_hash(task) }

        render :json => {
          total: total,
          subtotal: subtotal,
          page: pagination_params[:page],
          per_page: pagination_params[:per_page],
          sort: {
            by: ordering_params[:sort_by],
            order: ordering_params[:sort_order]
          },
          results: results
        }
      end

      api :POST, '/tasks/callback', N_('Send data to the task from external executor (such as smart_proxy_dynflow)')
      param :callback, Hash do
        param :task_id, :identifier, :desc => N_('UUID of the task')
        param :step_id, String, :desc => N_('The ID of the step inside the execution plan to send the event to')
      end
      param :data, Hash, :desc => N_('Data to be sent to the action')
      def callback
        task = ForemanTasks::Task::DynflowTask.find(params[:callback][:task_id])
        ForemanTasks.dynflow.world.event(task.external_id,
                                         params[:callback][:step_id].to_i,
                                         # We need to call .to_unsafe_h to unwrap the hash from ActionController::Parameters
                                         ::Actions::ProxyAction::CallbackData.new(params[:data].to_unsafe_h, :request_id => ::Logging.mdc['request']))
        render :json => { :message => 'processing' }.to_json
      end

      private

      def search_tasks(search_params)
        scope = resource_scope_for_index.select('DISTINCT foreman_tasks_tasks.*')
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
          scope.joins(:locks).where(foreman_tasks_locks:
                                        { name:          ::ForemanTasks::Lock::OWNER_LOCK_NAME,
                                          resource_type: 'User',
                                          resource_id:   search_params[:user_id] })
        when 'resource'
          if search_params[:resource_type].blank? || search_params[:resource_id].blank?
            raise BadRequest,
                  _('Resource search_params requires resource_type and resource_id to be specified')
          end
          scope.joins(:locks).where(foreman_tasks_locks:
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

      def find_task
        @task = Task.find(params[:id])
      end

      def resource_scope(_options = {})
        @resource_scope ||= ForemanTasks::Task.authorized("#{action_permission}_foreman_tasks")
      end

      def action_permission
        case params[:action]
        when 'bulk_search'
          :view
        when 'bulk_resume'
          :edit
        else
          super
        end
      end
    end
  end
  # rubocop:enable Metrics/ClassLength
end
